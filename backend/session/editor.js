const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// Save source code to DB
router.put('/:roomId/code', async (req, res) => {
    try {
        const { roomId } = req.params;
        const { code } = req.body;

        if (typeof code !== 'string') {
            return res.status(400).json({ error: 'code is required' });
        }

        const updatedRoom = await Room.findOneAndUpdate(
            { roomId },
            { $set: { sourceCode: code } },
            { returnDocument: 'after' }
        );

        if (!updatedRoom) {
            return res.status(404).json({ error: 'Room not found' });
        }

        res.status(200).json({ message: 'Code saved successfully' });
    } catch (error) {
        console.error('Error saving code:', error);
        res.status(500).json({ error: 'Failed to save code. Please try again later.' });
    }
});
//update lang route
router.put('/:roomId/:language', async (req, res) => {
    try {
        const { roomId, language } = req.params;

        if (!language) {
            return res.status(400).json({ error: 'Language is required' });
        }

        const updatedRoom = await Room.findOneAndUpdate(
            { roomId },
            { $set: { language } },
            { returnDocument: 'after' }
        );

        if (!updatedRoom) {
            return res.status(404).json({ error: 'Room not found' });
        }

        res.status(200).json({ message: 'Language updated successfully', language: updatedRoom.language });
    } catch (error) {
        console.error('Error updating language:', error);
        res.status(500).json({ error: 'Failed to update language. Please try again later.' });
    }
});
module.exports = router;