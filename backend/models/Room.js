
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
    createdBy: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: null
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

// TTL index: MongoDB will auto-delete documents once expiresAt is reached.
// Guest rooms have expiresAt = null so they are NOT auto-deleted by this index
// (they are deleted on disconnect instead).
roomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Room', roomSchema);
