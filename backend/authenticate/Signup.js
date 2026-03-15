const express = require('express');
const jwt = require('jsonwebtoken');
const { hashPassword } = require('./password');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

router.post('/signup', async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        if (!name || !username || !email || !password) {
            return res.status(400).json({ message: 'name, username, email, and password are required' });
        }

        if (username.length < 3) {
            return res.status(400).json({ message: 'username must be at least 3 characters' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'password must be at least 6 characters' });
        }

        const normalizedEmail = String(email).toLowerCase().trim();
        const normalizedUsername = String(username).toLowerCase().trim();

        const existingEmail = await User.findOne({ email: normalizedEmail });
        if (existingEmail) {
            return res.status(409).json({ message: 'email already registered' });
        }

        const existingUsername = await User.findOne({ username: normalizedUsername });
        if (existingUsername) {
            return res.status(409).json({ message: 'username already taken' });
        }

        const passwordHash = await hashPassword(password);

        const user = await User.create({
            name: String(name).trim(),
            username: normalizedUsername,
            email: normalizedEmail,
            passwordHash,
        });

        const token = jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        return res.status(201).json({
            message: 'signup successful',
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
