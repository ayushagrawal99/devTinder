const jwt = require('jsonwebtoken');
const User = require('../models/user');

const userAuth = async (req, res, next) => {
    try {
        const cookies = req.cookies;
        const {token} = cookies;

        if(!token){
            throw new Error("Token is not accessable");
        }

        const decodedToken = jwt.verify(token, '#devTinder@123');
        const {_id} = decodedToken;

        if(!_id){
            throw new Error("Token is not correct"); 
        }

        let user = await User.findById({_id});
        if(!user){
            throw new Error("user is not found");
        }

        // attached login user
        req.user = user;

        next();
    } catch (error) {
        res.status(400).send("Error "+error)
    }
}

module.exports = {
    userAuth
}