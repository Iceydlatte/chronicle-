   require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));
// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const postsRouter = require('./routes/posts');
const usersRouter = require('./routes/users');
const commentsRouter = require('./routes/comments');

app.use('/api/posts', postsRouter);
app.use('/api/users', usersRouter);
app.use('/api', commentsRouter);

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog_platform';

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    console.log('MongoDB URI:', MONGODB_URI);
    app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message || err);
    process.exit(1);
  });
