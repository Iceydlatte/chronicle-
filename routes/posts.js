const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// multer storage config - save uploads to /uploads
const uploadDir = path.join(__dirname, '..', 'uploads');
if(!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir); },
  filename: function (req, file, cb) { cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g,'_')); }
});
const upload = multer({ storage });

// List posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).populate('author', 'name email');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create post (supports image upload field named 'image'). If Authorization Bearer token
// is provided, use it to set the author field.
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, content } = req.body;
    console.log('POST /api/posts called - title:', title, 'contentLen:', (content||'').length, 'filePresent:', !!req.file);
    const postData = { title, content };
    // Try to set author from token if present
    const auth = req.headers.authorization || req.headers.Authorization;
    if(auth && auth.toLowerCase().startsWith('bearer ')){
      try{
        const token = auth.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me');
        if(payload && payload.userId) postData.author = payload.userId;
      }catch(e){ /* ignore invalid token */ }
    }
    if(req.file){
      postData.imageUrl = `/uploads/${path.basename(req.file.path)}`;
    }
    const post = new Post(postData);
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error('Error saving post:', err);
    res.status(400).json({ error: err.message });
  }
});

// Increment views for a post
router.post('/:id/views', async (req, res) => {
  try{
    const post = await Post.findById(req.params.id);
    if(!post) return res.status(404).json({ error: 'Post not found' });
    post.views = (post.views || 0) + 1;
    await post.save();
    res.json({ views: post.views });
  }catch(err){ res.status(500).json({ error: err.message }); }
});

// Update post
router.put('/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete post and its comments
router.delete('/:id', async (req, res) => {
  try {
    await Comment.deleteMany({ post: req.params.id });
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    // delete uploaded image file if present
    if(post.imageUrl){
      try{
        const filePath = path.join(__dirname, '..', post.imageUrl.replace(/^\//,''));
        if(fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }catch(e){ /* ignore unlink errors */ }
    }
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save a post for the authenticated user
router.post('/:id/save', async (req, res) => {
  try {
    const auth = req.headers.authorization || req.headers.Authorization;
    if(!auth || !auth.toLowerCase().startsWith('bearer ')) return res.status(401).json({ error: 'Authorization required' });
    const token = auth.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me');
    if(!payload || !payload.userId) return res.status(401).json({ error: 'Invalid token' });
    const post = await Post.findById(req.params.id);
    if(!post) return res.status(404).json({ error: 'Post not found' });
    const uid = payload.userId;
    if(!post.savedBy) post.savedBy = [];
    if(!post.savedBy.find(x => x.toString() === uid.toString())){
      post.savedBy.push(uid);
      await post.save();
    }
    res.json({ message: 'Saved' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Unsave a post for the authenticated user
router.post('/:id/unsave', async (req, res) => {
  try {
    const auth = req.headers.authorization || req.headers.Authorization;
    if(!auth || !auth.toLowerCase().startsWith('bearer ')) return res.status(401).json({ error: 'Authorization required' });
    const token = auth.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me');
    if(!payload || !payload.userId) return res.status(401).json({ error: 'Invalid token' });
    const post = await Post.findById(req.params.id);
    if(!post) return res.status(404).json({ error: 'Post not found' });
    const uid = payload.userId;
    if(post.savedBy && post.savedBy.find(x => x.toString() === uid.toString())){
      post.savedBy = post.savedBy.filter(x => x.toString() !== uid.toString());
      await post.save();
    }
    res.json({ message: 'Unsaved' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
