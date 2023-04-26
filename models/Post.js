const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const postSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        unique: true,
      },
      description: {
        type: String,
        required: true,
      },
      author: {
        type: ObjectId,
        ref:"User",
      },
      created: { 
        type: Date, 
        default: Date.now ,
      },
      likedBy: [
        {
          type: ObjectId,
          ref: "User",
        },
      ],
      comments: [
        {
          type: ObjectId,
          ref: "Comment",
        },
      ],


})

module.exports = mongoose.model('Post', postSchema);