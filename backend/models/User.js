const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        username: { type: String, required: true, unique: true, lowercase: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        recentSessions: {
            type: [{
                roomId: { type: String },
                lastOpenedAt: { type: Date, default: Date.now }
            }],
            default: []
        },
        createdSessions: {
            type: [{
                roomId: { type: String },
                createdAt: { type: Date, default: Date.now }
            }],
            default: []
        }
    },
    { timestamps: true, collection: 'UserData' }
);

module.exports = mongoose.model('User', userSchema);
