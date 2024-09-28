const express = require('express');
const User = require('../models/user');
const connectionRequest = require('../models/connectionRequest');
const {userAuth} = require('../middleware/auth');

const requestRouter = express.Router();

requestRouter.post('/request/send/:status/:toUserId', userAuth, async (req,res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        let ALLOWED_STATUS = ["ignored", "intrested"];
        if(!ALLOWED_STATUS.includes(status)){
            return res.status(400).json({
                message: `${status} Status not allowed`
            })
        }

        let userCheck = await User.findOne({_id: toUserId});
        if(!userCheck){
            return res.status(400).json({
                message: "User not found"
            })
        }
      
        let isConnectionEstablished = await connectionRequest.findOne({
            $or : [
                {fromUserId, toUserId},
                {fromUserId: toUserId, toUserId : fromUserId}
            ]
        });

        if(isConnectionEstablished){
            return res.status(400).json({
                message: "Connection request already present"
            })
        }

        let connectionRequestData = await connectionRequest({
            fromUserId,
            toUserId,
            status
        });
        await connectionRequestData.save();

        res.json({
            message: `${req.user.firstName} is send ${status} to ${userCheck.firstName}`
        })
    } catch (error) {
        res.status(400).send("Error "+error)
    }
})

requestRouter.post('/request/review/:status/:requestId', userAuth, async (req,res) => {
    try {
        const loggedInUser = req.user;
        const requestId = req.params.requestId;
        const status = req.params.status;

        let ALLOWED_STATUS = ["accepted", "rejected"];
        if(!ALLOWED_STATUS.includes(status)){
            return res.status(400).json({
                message: `${status} Status not allowed`
            })
        }

        let connectionRequestDt = await connectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "intrested"
        })
        if(!connectionRequestDt){
            return res.status(400).json({
                message: "Connection request not found"
            })
        }

        connectionRequestDt.status = status;

        await connectionRequestDt.save();

        res.json({
            message: `Connection stablished successfully`
        })
    } catch (error) {
        res.status(400).send("Error "+error)
    }
})


module.exports = requestRouter;