const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if(!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const existing = await User.findOne({ email });
    if(existing) return res.status(409).json({ error: 'User already exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, passwordHash: hash });
    await user.save();
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ user: { _id: user._id, name: user.name, email: user.email }, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = await User.findOne({ email });
    if(!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash || '');
    if(!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ user: { _id: user._id, name: user.name, email: user.email }, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List users (admin/debug)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-passwordHash');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
