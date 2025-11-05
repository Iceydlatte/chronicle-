const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    authorName: { type: String, required: true },
    content: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', CommentSchema);
