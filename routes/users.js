const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');

const router = express.Router();

// Get User Profile & Their Posts
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    const posts = await Post.find({ author: req.params.id }).sort({ createdAt: -1 });
    res.json({ user, posts });
  } catch {
    res.status(500).json({ msg: 'Error fetching profile' });
  }
});

module.exports = router;
