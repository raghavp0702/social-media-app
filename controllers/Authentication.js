
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const router = express.Router();
const app = express();

router.get('/', function (req, res) {
    res.send('Hello World!');
  });

router.post('/',async(req,res)=>{
    const {email,password} = req.body;

    if(!email)
    {
        return res.status(401).json({ message: "Email is required" });
    }

    const user = await User.findOne({email});

    if (!user) {
      return res.status(401).json({ message: "User does not exist" });
    }

    if (password !== user.password) {
      return res.status(401).json({ message: "Wrong Password entered" });
    }
    // console.log(user._id);
    const token = jwt.sign({ userID: user._id }, "secret", {
      expiresIn: "14d",
    });
    // const token = jwt.sign( {userID: user._id}, process.env.SECRET,{expiresIn:'4h'},function(err, token) {
    //     console.log(token);
    //   });
    res.json({token});
});

// const getToken = (req,res,next)=>{
    
//     const token = req.headers.authorization?.split('')[1];

//     if(!token)
//     {
//         return res.json({message:'Please login first , No token available'});
//     }

//     try {
//         const checkToken = jwt.verify(token,process.env.SECRET);
//         console.log(checkToken);
//         req.userID = checkToken.userID;
//         next();
//     } catch (err) {
//         return res.json({ message: 'Invalid token' });
//     }

// }



module.exports = router;
