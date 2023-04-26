const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim:true
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    password: {
        type: String,
        required: true
    },
    followers:[
        {
            type: ObjectId,
            ref: "User"
        },
    ],
    following:[
        {
            type: ObjectId,
            ref: "User"
        },
    ]


},{
    timestamps: true
})

module.exports = mongoose.model('User', userSchema);