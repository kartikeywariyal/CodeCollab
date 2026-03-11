const express = require('express');
const jwt = require('jsonwebtoken');
const { hashPassword } = require('./password');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'name, email, and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'password must be at least 6 characters' });
        }

        const normalizedEmail = String(email).toLowerCase().trim();

        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
            return res.status(409).json({ message: 'email already registered' });
        }

        const passwordHash = await hashPassword(password);

        const user = await User.create({
            name: String(name).trim(),
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
                email: user.email,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: 'internal server error' });
    }
});

module.exports = router;
