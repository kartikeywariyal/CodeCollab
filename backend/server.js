require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const signupRouter = require('./authenticate/Signup');
const signinRouter = require('./authenticate/Signin');
const sessionRouter = require('./session/session');
const editorRouter = require('./session/editor');
const Room = require('./models/Room');

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Failed to connect to MongoDB:', error));

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the CodeCollab server!' });
});

app.use('', signupRouter);
app.use('', signinRouter);
app.use('/session', sessionRouter);
app.use('/editor', editorRouter);

// ─── Code Execution via JDoodle ─────────────────────────────────────────────
// JDoodle language map: Monaco ID → { language, versionIndex }
const JDOODLE_LANG_MAP = {
    javascript: { language: 'nodejs',   versionIndex: '4' },
    python:     { language: 'python3',  versionIndex: '4' },
    java:       { language: 'java',     versionIndex: '4' },
    cpp:        { language: 'cpp17',    versionIndex: '1' },
    typescript: { language: 'typescript', versionIndex: '1' },
    go:         { language: 'go',       versionIndex: '4' },
    rust:       { language: 'rust',     versionIndex: '4' },
};

app.post('/run', async (req, res) => {
    const { code, language } = req.body;

    if (!code || !language) {
        return res.status(400).json({ error: 'code and language are required' });
    }

    const langConfig = JDOODLE_LANG_MAP[language];
    if (!langConfig) {
        return res.status(400).json({ error: `Unsupported language: ${language}` });
    }

    try {
        const response = await fetch('https://api.jdoodle.com/v1/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clientId:     process.env.JDOODLE_CLIENT_ID,
                clientSecret: process.env.JDOODLE_CLIENT_SECRET,
                script:       code,
                language:     langConfig.language,
                versionIndex: langConfig.versionIndex,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.error || 'Execution failed' });
        }

        return res.json({
            output: data.output || '',
            statusCode: data.statusCode,
            memory: data.memory,
            cpuTime: data.cpuTime,
        });
    } catch (err) {
        console.error('JDoodle error:', err);
        return res.status(500).json({ error: 'Code execution service unavailable' });
    }
});

// ─── In-memory room state ───────────────────────────────────────────────────
// roomState[roomId] = { code: string, users: [{ socketId, displayName, username }] }
const roomState = {};

function getRoomUsers(roomId) {
    return (roomState[roomId]?.users || []).map(({ displayName, username }) => ({
        displayName,
        username
    }));
}

// ─── Socket.IO Events ───────────────────────────────────────────────────────
io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join room
    socket.on('join-room', ({ roomId, displayName, username }) => {
        socket.join(roomId);

        if (!roomState[roomId]) {
            roomState[roomId] = { code: '', users: [] };
        }

        // Add user to in-memory list (avoid duplicates by socketId)
        roomState[roomId].users = roomState[roomId].users.filter(u => u.socketId !== socket.id);
        roomState[roomId].users.push({ socketId: socket.id, displayName, username: username || null });

        // Store user info on the socket for cleanup on disconnect
        socket.data.roomId = roomId;
        socket.data.displayName = displayName;
        socket.data.username = username || null;

        // Send current code state to the joining user
        socket.emit('init-code', { code: roomState[roomId].code });

        // Notify everyone in the room of the updated user list
        io.to(roomId).emit('users-updated', { users: getRoomUsers(roomId) });

        console.log(`${displayName} joined room ${roomId}`);
    });

    // Code change — broadcast to everyone else in the room, do NOT hit DB
    socket.on('code-change', ({ roomId, code }) => {
        if (roomState[roomId]) {
            roomState[roomId].code = code;
        }
        // Broadcast to every OTHER socket in the room
        socket.to(roomId).emit('code-change', { code });
    });
    socket.on('language-change', ({ roomId, language }) => {
        if (roomState[roomId]) {
            roomState[roomId].language = language;
        }

        io.to(roomId).emit('language-change', { language });
    });
    // Explicit leave (disconnect button)
    socket.on('leave-room', ({ roomId }) => {
        handleLeave(socket, roomId);
    });

    // Auto-cleanup on disconnect
    socket.on('disconnect', () => {
        const roomId = socket.data.roomId;
        if (roomId) {
            handleLeave(socket, roomId);
        }
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

function handleLeave(socket, roomId) {
    socket.leave(roomId);
    if (roomState[roomId]) {
        roomState[roomId].users = roomState[roomId].users.filter(u => u.socketId !== socket.id);
        io.to(roomId).emit('users-updated', { users: getRoomUsers(roomId) });
        // Clean up empty rooms from memory
        if (roomState[roomId].users.length === 0) {
            delete roomState[roomId];
        }
    }
}

// ─── Periodic DB save every 2 minutes ──────────────────────────────────────
setInterval(async () => {
    const roomIds = Object.keys(roomState);
    if (roomIds.length === 0) return;

    console.log(`[Auto-save] Persisting ${roomIds.length} active room(s) to DB...`);
    for (const roomId of roomIds) {
        try {
            await Room.findOneAndUpdate(
                { roomId },
                { $set: { sourceCode: roomState[roomId].code } },
                { new: true }
            );
        } catch (err) {
            console.error(`[Auto-save] Failed for room ${roomId}:`, err.message);
        }
    }
}, 2 * 60 * 1000); // every 2 minutes

// ─── Start server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});