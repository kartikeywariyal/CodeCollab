const express = require('express');
const jwt = require('jsonwebtoken');
const { verifyPassword } = require('./password');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'email and password are required' });
        }

        const normalizedEmail = String(email).toLowerCase().trim();

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({ message: 'invalid email or password' });
        }

        const passwordOk = await verifyPassword(password, user.passwordHash);
        if (!passwordOk) {
            return res.status(401).json({ message: 'invalid email or password' });
        }

        const token = jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        return res.json({
            message: 'login successful',
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
