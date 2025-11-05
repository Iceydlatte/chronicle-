const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');

// Create a comment on a post
router.post('/posts/:postId/comments', async (req, res) => {
  try {
    const { authorName, content } = req.body;
    if(!content) return res.status(400).json({ error: 'Content is required' });
    const post = await Post.findById(req.params.postId);
    if(!post) return res.status(404).json({ error: 'Post not found' });
    const comment = new Comment({ post: post._id, authorName: authorName || 'Anonymous', content });
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ error: err.message });
  }
});

// List comments for a post
router.get('/posts/:postId/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId }).sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
