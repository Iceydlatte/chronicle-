const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    imageUrl: { type: String },
    // list of users who saved this post
    savedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
    ,views: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', PostSchema);
