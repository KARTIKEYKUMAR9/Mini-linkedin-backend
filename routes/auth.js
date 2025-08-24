const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// ✅ Register
router.post('/register', async (req, res) => {
  const { name, email, password, bio } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ msg: 'Email already in use' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashed, bio });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET,{
      expiresIn: "7d",
    });

    return res.status(201).json({
      message: "User registered",
      token,
      user: { id: user._id, name: user.name, email: user.email, bio: user.bio }
    });

  } catch (err) {
    return res.status(500).json({ msg: 'Server error' });
  }
});

// ✅ Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET,{
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "User logged in",
      token,
      user: { id: user._id, name: user.name, email: user.email, bio: user.bio }
    });

  } catch (err) {
    return res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;