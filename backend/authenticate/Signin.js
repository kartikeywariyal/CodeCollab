const express = require('express');
const jwt = require('jsonwebtoken');
const { verifyPassword } = require('./password');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

router.post('/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ message: 'email/username and password are required' });
        }

        const normalizedIdentifier = String(identifier).toLowerCase().trim();

        // Find user by email OR username
        const user = await User.findOne({
            $or: [
                { email: normalizedIdentifier },
                { username: normalizedIdentifier }
            ]
        });

        if (!user) {
            return res.status(401).json({ message: 'invalid credentials' });
        }

        const passwordOk = await verifyPassword(password, user.passwordHash);
        if (!passwordOk) {
            return res.status(401).json({ message: 'invalid credentials' });
        }

        const token = jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        return res.json({
            message: 'login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: 'internal server error' });
    }
});

module.exports = router;
