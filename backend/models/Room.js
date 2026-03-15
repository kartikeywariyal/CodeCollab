
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    displayName: {
        type: String,
        required: true,
        trim: true
    },
    language: {
        type: String,
        default: 'javascript'
    },
    agenda: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // Automatically delete after 24 hours
    },
    users: {
        type: [Object],
        default: []
    },
    sourceCode: {
        type: String,
        default: 'write'
    }
});

module.exports = mongoose.model('Room', roomSchema);
