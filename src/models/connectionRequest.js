const mongoose = require('mongoose');

const ConnectionRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        require : true
    },
    toUserId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        require : true
    },
    status: {
        type: String,
        enum : {
            values: ["ignored", "intrested", "accepted", "rejected"],
            message: `{VALUE} is not acceptable status type`,
        },
        require : true
    },
}, {
    timestamps: true
});

ConnectionRequestSchema.index({fromUserId: 1, toUserId: 1})


// before save data in DB it will call
ConnectionRequestSchema.pre("save", function (next){
    const connectionRequest = this;
    
    // check fromUSerId is sane as toUserId
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new Error('You cant send connection request to itself')
    }
    next(); // bcz pre is a middleware so pass next()
})

const connectionRequest = mongoose.model('connectionRequest', ConnectionRequestSchema);
module.exports = connectionRequest;