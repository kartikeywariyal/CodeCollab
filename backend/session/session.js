const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Room = require('../models/Room');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function getUserFromToken(req) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return null;
    try {
        return jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET);
    } catch {
        return null;
    }
}

// Helper: upsert a room into the user's recentSessions (move to front, cap at 20)
async function trackRecentSession(username, roomId) {
    if (!username) return;
    await User.updateOne({ username }, { $pull: { recentSessions: { roomId } } });
    await User.updateOne(
        { username },
        { $push: { recentSessions: { $each: [{ roomId, lastOpenedAt: new Date() }], $position: 0, $slice: 20 } } }
    );
}

// Route to create a new session OR join an existing one
router.post('/create', async (req, res) => {
    try {
        const { roomId, displayName, language, agenda, username } = req.body;

        if (!roomId || !displayName) {
            return res.status(400).json({ error: 'Room ID and Display Name are required' });
        }

        const normalizedDisplay = String(displayName).trim();

        const existingRoom = await Room.findOne({ roomId });

        if (existingRoom) {
            const nameTaken = existingRoom.users.some(
                (u) => u.displayName?.toLowerCase() === normalizedDisplay.toLowerCase()
            );
            if (nameTaken) {
                return res.status(409).json({
                    error: `Display name "${normalizedDisplay}" is already taken in this room. Please choose a different one.`
                });
            }

            existingRoom.users.push({
                username: username || null,
                displayName: normalizedDisplay,
                joinedAt: new Date()
            });
            await existingRoom.save();

            // Track in recentSessions for logged-in user
            await trackRecentSession(username, roomId);

            return res.status(200).json({ message: 'Joined room successfully', roomId });
        }

        // --- CREATE NEW ROOM ---
        const initialUsers = [{ username: username || null, displayName: normalizedDisplay, joinedAt: new Date() }];

        const newRoom = new Room({
            roomId,
            displayName: normalizedDisplay,
            language,
            agenda,
            createdBy: username || null,
            expiresAt: username ? new Date(Date.now() + 86400 * 1000) : null,
            users: initialUsers
        });
        await newRoom.save();

        // Track in createdSessions + recentSessions for logged-in user
        if (username) {
            await User.updateOne(
                { username, 'createdSessions.roomId': { $ne: roomId } },
                { $push: { createdSessions: { roomId, createdAt: new Date() } } }
            );
            await trackRecentSession(username, roomId);
        }

        return res.status(201).json({ message: 'Session started successfully', roomId });
    } catch (error) {
        console.error('Error starting session:', error);
        res.status(500).json({ error: 'Failed to start session. Please try again later.' });
    }
});

// GET /session/my-sessions — returns logged-in user's created + recent sessions enriched with room data
router.get('/my-sessions', async (req, res) => {
    try {
        const payload = getUserFromToken(req);
        if (!payload) return res.status(401).json({ error: 'Unauthorized' });

        const user = await User.findById(payload.sub).select('recentSessions createdSessions');
        if (!user) return res.status(404).json({ error: 'User not found' });

        const recentIds = user.recentSessions.map(s => s.roomId);
        const createdIds = user.createdSessions.map(s => s.roomId);
        const allIds = [...new Set([...recentIds, ...createdIds])];

        const rooms = await Room.find({ roomId: { $in: allIds } });
        const roomMap = {};
        rooms.forEach(r => { roomMap[r.roomId] = r; });

        const recentSessions = user.recentSessions.map(s => ({
            roomId: s.roomId,
            lastOpenedAt: s.lastOpenedAt,
            language: roomMap[s.roomId]?.language || 'javascript',
            agenda: roomMap[s.roomId]?.agenda || '',
            roomCreatedAt: roomMap[s.roomId]?.createdAt || null,
            expiresAt: roomMap[s.roomId]?.expiresAt || null,
            createdBy: roomMap[s.roomId]?.createdBy || null,
            exists: !!roomMap[s.roomId]
        }));

        const createdSessions = user.createdSessions.map(s => ({
            roomId: s.roomId,
            createdAt: s.createdAt,
            language: roomMap[s.roomId]?.language || 'javascript',
            agenda: roomMap[s.roomId]?.agenda || '',
            roomCreatedAt: roomMap[s.roomId]?.createdAt || null,
            expiresAt: roomMap[s.roomId]?.expiresAt || null,
            createdBy: roomMap[s.roomId]?.createdBy || null,
            exists: !!roomMap[s.roomId]
        }));

        res.status(200).json({ recentSessions, createdSessions });
    } catch (error) {
        console.error('Error fetching user sessions:', error);
        res.status(500).json({ error: 'Failed to fetch sessions.' });
    }
});

// Route to get session details by roomId (must stay AFTER /my-sessions)
router.get('/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await Room.findOne({ roomId });

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        res.status(200).json(room);
    } catch (error) {
        console.error('Error fetching session:', error);
        res.status(500).json({ error: 'Failed to fetch session. Please try again later.' });
    }
});
module.exports = router;
