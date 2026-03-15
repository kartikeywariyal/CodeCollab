const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

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