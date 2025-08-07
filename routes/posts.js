const express = require('express');
const Post = require('../models/Post');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/test', (req, res) => {
  res.send("Backend working!");
});

// Create Post
router.post('/', auth, async (req, res) => {
  const { content } = req.body;

  try {
    const post = await Post.create({
      author: req.user,
      content
    });
    res.json(post);
  } catch {
    res.status(500).json({ msg: 'Post creation failed' });
  }
});

// Get All Posts (Public Feed)
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find()
    .populate('author', 'name')
    .populate('comments.author',"name")
    .sort({ createdAt: -1 });
    res.json(posts);
  } catch {
    res.status(500).json({ msg: 'Failed to fetch posts' });
  }
});


// like route
router.put('/:id/like',auth, async (req,res)=>{
  try{
    const post = await Post.findById(req.params.id);
    const userId =req.user.id;

    if(!post) return res.status(404).json({message: "Post not found"});

    const alreadyLiked = post.likes.includes(userId);

    if(alreadyLiked){
      post.likes.pull(userId);
    }else{
      post.likes.push(userId);
    }

    await post.save();
    res.json(post);
  }catch(err){
    res.status(500).json({message:"Server error"});
  }
});


// Get comments for a post
router.get('/:id/comments', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('comments.author', 'name');
    if (!post) return res.status(404).json({ message: 'Post not found' });

    res.json(post.comments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});


// comment route
// Add a comment to a post
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ text, author: req.user.id });
    await post.save();

    // Re-fetch the post to populate comments properly
    const updatedPost = await Post.findById(req.params.id)
      .populate('comments.author', 'name');

    res.status(201).json(updatedPost.comments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add comment' });
  }
});



module.exports = router;
