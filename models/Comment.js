const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const commentSchema = new mongoose.Schema({

    comment: {
        type: String,
        required: true,
      },
      
      author: {
        type: ObjectId,
        ref:"User",
      },
      post: {
        type: ObjectId,
        ref:"Post",
      },
})

module.exports = mongoose.model('Comment', commentSchema);