const express = require('express');

const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const router = express.Router();

const jwt = require('jsonwebtoken');

// const getToken = require("./checkToken");

function getToken(req, res, next) {
  const token = req.headers.Authorization || req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "No token found" });
  }

//   jwt.verify(token, "secret", (err, decoded) => {
//     // console.log(decoded.userID);
//     if (err) {
//       res.status(401).json({ message: "User is not authorized" });
//     }
//     if (!decoded.userID) {
//       res.status(401).json({ message: "User is not authorized" });
//     } else {
//       req.userID = decoded.userID;
//     }
//     // console.log(req.userID);
//     next();
//   });

    try {
        const decodedToken = jwt.verify(token, 'secret');
        req.userID = decodedToken.userID;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }


}

router.post("/follow/:id", getToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { userID } = req;
    // console.log({userID, id});
    const user = await User.findById(userID); // 1
    const theUserToFollow = await User.findById(id); // 2

    if (!theUserToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.following.includes(id)) {
      // does 1 follow 2
      return res
        .status(400)
        .json({ message: "Current user is already following them" });
    }
    user.following.push(id);

    await user.save();

    theUserToFollow.followers.push(userID); // add 1 to 2's follower's list
    await theUserToFollow.save();

    res.json({ message: "User followed successfully" });
  } catch (err) {
    res.status(401).json({ message: "Couldnt perform the follow" });
  }
});

router.post("/unfollow/:id", getToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { userID } = req;
    // console.log({userID, id});
    const user = await User.findById(userID); // 1
    const theUserToUnfollow = await User.findById(id); // 2

    if (!theUserToUnfollow) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.following.includes(id)) {
      // does 1 follow 2
      return res
        .status(400)
        .json({ message: "Current user is not following them" });
    }
    user.following.filter((followingId) => followingId != userID);

    await user.save();

    theUserToUnfollow.followers.filter((followerId) => followerId != id); // add 1 to 2's follower's list
    await theUserToUnfollow.save();

    res.json({ message: "User unfollowed successfully" });
  } catch (err) {
    res.status(401).json({ message: "Couldnt perform the unfollow" });
  }
});

//get user profile
router.get("/user", getToken, async (req, res) => {
  try {
    const { userID } = req;

    const user = await User.findById(userID).populate("followers", "following");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // console.log("done user profile");

    res.json({
      name: user.name,
      followers: user.followers.length,
      following: user.following.length,
    });
  } catch (err) {
    res.status(401).json({ message: "Couldnt get the user profile" });
  }
});

router.post("/posts", getToken, async (req, res) => {
  // try {
    const { title, description } = req.body;
    if(!title || !description)
    {
        res.status(404).json({ message:"One of the fields is missing"})
    }
    const { userID } = req;
    // console.log(userID);

    const newpost = new Post({ title, description, author: userID });
    await newpost.save();

    res.json({
      postID: newpost._id,
      title: newpost.title,
      description: newpost.description,
      created: newpost.created,
    });
  // } catch (err) {
  //   res.status(401).json({ message: "Couldnt create the post" });
  // }
});

router.delete("/posts/:id", getToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userID } = req;

    const checkpost = await Post.findOne({ _id: id, author: userID });

    if (!checkpost) {
      return res.status(404).json({ message: "This post does not exist" });
    }

    const post = await Post.findByIdAndDelete({ _id: id });

    res.json({ message: "Post deleted succesfullly" });
  } catch (err) {
    res.status(401).json({ message: "Couldnt delete the post" });
  }
});

router.post("/like/:id", getToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userID } = req;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "This post does not exist" });
    }
    if (post.likedBy.includes(userID)) {
      return res.status(400).json({ message: "Post is already liked" });
    }

    post.likedBy.push(userID);
    await post.save();
    res.status(200).json({ message: "post liked sucessfully" });
  } catch (err) {
    res.status(401).json({ message: "error occured" });
  }
});

router.post("/unlike/:id", getToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userID } = req;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "This post does not exist" });
    }
    if (!post.likedBy.includes(userID)) {
      return res.status(400).json({ message: "Post is not liked" });
    }

    post.likedBy.filter((likeid) => likeid != userID);
    await post.save();
    res.status(200).json({ message: "post unliked sucessfully" });
  } catch (err) {
    res.status(401).json({ message: "Couldnt perform the unlike" });
  }
});

router.post("/comment/:id", getToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userID } = req;

    const { comment } = req.body;

    const newcomment = new Comment({
      comment: comment,
      author: userID,
      post: id,
    });

    await newcomment.save();

    const post = await Post.findById(id);
    post.comments.push(newcomment._id);

    await post.save();

    res.json({ commentId: newcomment._id });
  } catch (err) {
    res.status(401).json({ message: "Couldnt perform the comment" });
  }
});

router.get("/posts/:id", getToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userID } = req;

    const allcomments = await Comment.find({ post: id });
    // console.log({ allcomments });

    // allcomments.filter((comment)=> comment.post.equals(id));

    const thispost = await Post.findById({ _id: id }).populate('author');
    // console.log(thispost);
    return res.json({
        title:thispost.title,
        description: thispost.description,
        author: thispost.author.name,
        created_at: thispost.created,
        numberOfLikes: thispost.likedBy.length,
        numberOfComments: allcomments.length,
    });
  } catch (err) {
    res.status(401).json({ message: "Couldnt get the post" });
  }
});

router.get("/all_posts", getToken, async (req, res) => {
  try {
    const { userID } = req;

    const posts = await Post.find({ author: userID })
      .sort({ created: -1 })
      .populate("comments");

    const result = posts.map((post) => ({
      id: post._id,
      title: post.title,
      description: post.description,
      created: post.created,
      comments: post.comments.map((comment) => comment.comment),
      likes: post.likedBy.length,
    }));

    return res.json({ result });
  } catch (err) {
    res.status(401).json({ message: "Couldnt get all the posts" });
  }
});

module.exports = router;