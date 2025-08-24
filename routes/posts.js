const express = require("express");
const Post = require("../models/Post");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/test", (req, res) => {
  res.send("Backend working!");
});

// Create Post
router.post("/", auth, async (req, res) => {
  const { content } = req.body;

  try {
    const post = await Post.create({
      author: req.user, // req.user is just the userId from middleware
      content,
    });

    // Re-fetch with populate so frontend gets author info directly
    const newPost = await Post.findById(post._id)
      .populate("author", "name")
      .populate("comments.author", "name");

    res.json(newPost);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get All Posts (Feed)
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name")
      .populate("comments.author", "name")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Failed to fetch posts" });
  }
});

// Toggle Like
router.post("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.user;

    if (!post) return res.status(404).json({ msg: "Post not found" });

    if (post.likes.includes(userId)) {
      // Unlike
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();
    res.json({ likes: post.likes });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// Edit a Post
router.put("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    if (post.author.toString() !== req.user) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    post.content = req.body.content || post.content;
    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("author", "name")
      .populate("comments.author", "name");

    res.json(updatedPost);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Delete a Post
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    console.log(post);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    if (post.author.toString() !== req.user) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    await post.deleteOne();
    res.json({ success: true, msg: "Post removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get Comments for a Post
router.get("/:id/comments", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "comments.author",
      "name"
    );
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

// Add a Comment
router.post("/:id/comments", auth, async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ text, author: req.user });
    await post.save();

    // Re-fetch to get populated author info
    const updatedPost = await Post.findById(req.params.id).populate(
      "comments.author",
      "name"
    );

    res.status(201).json(updatedPost.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Failed to add comment" });
  }
});


// Delete a comment
router.delete("/:postId/comments/:commentId", auth, async (req,res)=>{
  try{
    const {postId,commentId} = req.params;
    const post = await Post.findById(postId);
    if(!post) return res.status(404).json({message: "Post not found"});
    
    const comment = post.comments.id(commentId);
    if(comment) return res.status(404).json({message:"Comment not found"})

    if(comment.author.toString() !== req.user.id){
      return res.status(401).json({message: "Not authorized"})
    }

    comment.remove();
    await post.save();

    res.json({msg:"Comment deleted"});
  }catch(err){
    console.error(err.message);
    res.status(500).json({message: "server error"});
  }
});
module.exports = router;