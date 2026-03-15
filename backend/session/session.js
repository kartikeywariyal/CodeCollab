const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// Route to create a new session OR join an existing one
router.post('/create', async (req, res) => {
    try {
        const { roomId, displayName, language, agenda, username } = req.body;

        if (!roomId || !displayName) {
            return res.status(400).json({ error: 'Room ID and Display Name are required' });
        }

        const normalizedDisplay = String(displayName).trim();

        // Check if room already exists
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

            // Add user to the room
            existingRoom.users.push({
                username: username || null,
                displayName: normalizedDisplay,
                joinedAt: new Date()
            });
            await existingRoom.save();

            return res.status(200).json({ message: 'Joined room successfully', roomId });
        }

        // --- CREATE NEW ROOM ---
        const initialUsers = [{ username: username || null, displayName: normalizedDisplay, joinedAt: new Date() }];

        const newRoom = new Room({
            roomId,
            displayName: normalizedDisplay,
            language,
            agenda,
            users: initialUsers
        });
        await newRoom.save();

        return res.status(201).json({ message: 'Session started successfully', roomId });
    } catch (error) {
        console.error('Error starting session:', error);
        res.status(500).json({ error: 'Failed to start session. Please try again later.' });
    }
});

// Route to get session details by roomId
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
