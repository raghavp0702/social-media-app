const express = require('express');

const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const router = express.Router();

const jwt = require('jsonwebtoken');

// const getToken = require("./checkToken");

function getToken (req,res,next){
    
    const token = req.headers.Authorization || req.headers.authorization;

    
    jwt.verify(token,'secret',(err,decoded)=>{
        // console.log(decoded.userID);
        if(err)
        {
            res.json({message:"User is not authorized"});
        }
        req.userID = decoded.userID;
        // console.log(req.userID);
        next();
    });


}

router.post("/follow/:id", getToken,async(req,res)=>{

    try {
        const {id} = req.params;
    
        const {userID} = req;
        // console.log({userID, id});
        const user = await User.findById(userID); // 1
        const theUserToFollow = await User.findById(id); // 2
    
        if(!theUserToFollow)
        {
            return res.json({message:"User not found"});
        }
        
        if(user.following.includes(id)) // does 1 follow 2
        {
            return res.json({message:"Current user is already following them"});
        }
        user.following.push(id);
    
        await user.save();
    
        theUserToFollow.followers.push(userID); // add 1 to 2's follower's list
        await theUserToFollow.save();
        
        res.json({ message: 'User followed successfully' });
        
    } catch (err) {
        res.json({message:"Couldnt perform the follow"})
    }

})

router.post("/unfollow/:id", getToken,async(req,res)=>{

    try {
        const {id} = req.params;
    
        const {userID} = req;
        // console.log({userID, id});
        const user = await User.findById(userID); // 1
        const theUserToUnfollow = await User.findById(id); // 2
    
        if(!theUserToUnfollow)
        {
            return res.json({message:"User not found"});
        }
        
        if(!user.following.includes(id)) // does 1 follow 2
        {
            return res.json({message:"Current user is not following them"});
        }
        user.following.filter((followingId) => followingId != userID);
    
        await user.save();
    
        theUserToUnfollow.followers.filter(
            (followerId) => followerId != id); // add 1 to 2's follower's list
        await theUserToUnfollow.save();
        
        res.json({ message: 'User unfollowed successfully' });
        
    } catch (err) {
        res.json({message:"Couldnt perform the unfollow"})
    }

})

//get user profile
router.get('/user',getToken,async(req,res)=>{
    const {userID} = req;

    const user = await User.findById(userID).populate('followers','following');

    if(!user)
    {
        return res.json({message:"User not found"});
    }
    // console.log("done user profile");

    res.json({
        name : user.name,
        followers: user.followers.length,
        following: user.following.length,
    });
});

router.post('/posts',getToken,async(req,res)=>{
    const {title,description} = req.body;

    const {userID} = req;
    // console.log(userID);

    const newpost = new Post({title,description, author:userID });
    await newpost.save();

    res.json({
        postId: newpost._id,
        title: newpost.title,
        description: newpost.description,
        created: newpost.created,
    });
})

router.delete('/posts/:id',getToken,async(req,res)=>{
    const {id} = req.params;
    const {userID} = req;

    const checkpost = await Post.findOne({_id : id, author : userID});

    if(!checkpost )
    {
        return res.json({message:"This post does not exist"});
    }

    const post = await Post.findByIdAndDelete({_id : id});


    res.json({message:"Post deleted succesfullly"});

})

router.post("/like/:id",getToken,async(req,res)=>{

    try {
        
        const {id} = req.params;
        const {userID} = req;
        
        const post = await Post.findById(id);
        
        if(!post)
        {
            return res.json({message:"This post does not exist"});
        }
        if(post.likedBy.includes(userID))
        {
            return res.json({message:"Post is already liked"});
        }
        
        post.likedBy.push(userID);
        await post.save();
        res.json({message:"post liked sucessfully"});
    } catch (err) {
        res.json({message:"error occured"});
    }
})

router.post("/unlike/:id",getToken,async(req,res)=>{
    const {id} = req.params;
    const {userID} = req;

    const post = await Post.findById(id);

    if(!post)
    {
        return res.json({message:"This post does not exist"});
    }
    if(!post.likedBy.includes(userID))
    {
        return res.json({message:"Post is not liked"});
    }

    post.likedBy.filter((likeid) => likeid != userID);
    await post.save();
    res.json({message:"post unliked sucessfully"});
})

router.post("/comment/:id",getToken,async(req,res)=>{

    const {id} = req.params;
    const {userID} = req;

    const {comment} = req.body;

    const newcomment = new Comment({
        comment: comment,
        author: userID,
        post : id,
    });

    await newcomment.save();

    const post = await Post.findById(id);
    post.comments.push(newcomment._id);

    await post.save();

    res.json({commentId : newcomment._id});
})

router.get("/posts/:id",getToken,async(req,res)=>{
    const {id} = req.params;
    const {userID} = req;

    const allcomments = await Comment.find({post :id});
    console.log({allcomments});


    // allcomments.filter((comment)=> comment.post.equals(id));

    const thispost = await Post.findById({_id: id});


    return res.json({
        numberOfLikes: thispost.likedBy.length,
        numberOfComments: allcomments.length,
    });
})

router.get("/all_posts",getToken,async(req,res)=>{
    const {userID} = req;

    const posts = await Post.find({ author: userID }).sort({ created: -1 }).populate('comments');
    
    const result = posts.map(post => ({
      id: post._id,
      title: post.title,
      desc: post.description,
      created: post.created,
      comments: post.comments.map(comment => comment.comment),
      likes: post.likedBy.length
    }));


      return res.json({result});
})

module.exports = router;