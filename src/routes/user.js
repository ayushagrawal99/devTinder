const express = require('express');
const {userAuth} = require('../middleware/auth');
const connectionRequest = require('../models/connectionRequest');
const User = require('../models/user');

const userRouter = express.Router();


// Get all the pending connection request for the loggedIn user
userRouter.get('/user/requests/received', userAuth, async (req,res) => {
    try {
        const loggedInUSer = req.user;

        let data = await connectionRequest.find({
            toUserId : loggedInUSer._id,
            status: "intrested"
        }).populate("fromUserId", "firstName lastName age about photoUrl skills")

        res.json({
            message: "data fetch successfully",
            data 
        })
    } catch (error) {
        res.status(400).send("Error "+error)
    }
})


userRouter.get('/user/connection', userAuth, async (req,res) => {
    try {
        const loggedInUSer = req.user;

        let data = await connectionRequest.find({
            $or : [
                {toUserId : loggedInUSer._id},
                {fromUserId : loggedInUSer._id}
            ],
            status: "accepted"
        })
        .populate("fromUserId", "firstName lastName age about photoUrl skills")
        .populate("toUserId", "firstName lastName age about photoUrl skills");

        data = data.map((el) => {
            if(el.fromUserId._id.toString() == loggedInUSer._id.toString()){
                return el.toUserId;
            }
            return el.fromUserId;
        })

        res.json({
            message: "data fetch successfully",
            data 
        })
    } catch (error) {
        res.status(400).send("Error "+error)
    }
})


// Show users on Feed
userRouter.get('/feed', userAuth, async (req,res) => {
    try {
        const loggedInUSer = req.user;

        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;
        const skip = limit * (page-1);

        // Find All connections
        let connectionReq = await connectionRequest.find({
            $or : [
                {toUserId : loggedInUSer._id},
                {fromUserId : loggedInUSer._id}
            ]
        }).select("fromUserId toUserId");

        // Hide All connections bcz it's already in status.
        let hideUser = new Set();
        connectionReq.map((el) => {
            hideUser.add(el.fromUserId.toString());
            hideUser.add(el.toUserId.toString());
        });

        // Find other user which we can show in Feed
        let data = await User.find({
            $and : [
                {_id : {$nin : Array.from(hideUser)}},
                {_id: {$ne : loggedInUSer._id}}
            ]
        }).select("firstName lastName age about photoUrl skills")
        .skip(skip).limit(limit);
        
        res.json({
            message: "data fetch successfully",
            data 
        })
    } catch (error) {
        res.status(400).send("Error "+error)
    }
})

module.exports = userRouter;