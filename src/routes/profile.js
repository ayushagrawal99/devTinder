const express = require('express');
const User = require('../models/user');
const {userAuth} = require('../middleware/auth');
const {validateEditUserData} = require('../utils/validation');
const validator = require('validator');
const bcrypt = require('bcrypt');

const profileRouter = express.Router();


profileRouter.get('/profile/view', userAuth, async (req,res,next) => {
    try {
        const user = req.user;

        res.json({
            message : "User profile data",
            data : user
        })
    } catch (error) {
        res.status(400).send("Error "+error)
    }
});

profileRouter.patch('/profile/edit', userAuth, async (req,res,next) => {
    try {
        validateEditUserData(req);

        let loggedInUser = req.user;
        Object.keys(req.body).forEach((key) => loggedInUser[key] = req.body[key]);

        await loggedInUser.save();

        res.send({
            message : "User profile update successfully",
            data : loggedInUser
        }) 
    } catch (error) {
        res.status(400).send("Error "+error)
    }
})

profileRouter.patch('/profile/password', userAuth, async (req,res,next) => {
    try {
        let password = req?.body?.password || null;
        if(password){
            if(!validator.isStrongPassword(password)){
                throw new Error("Please update the Strong password")
            }
        } else{
            throw new Error("Please send the password")
        }

        // Encrypt the password
        let hashedPassword = await bcrypt.hash(password, 10);

        await User.findByIdAndUpdate(req.user._id, {
            password: hashedPassword
        });

        res.cookie('token', null, {
            expires: new Date(Date.now())
        })
        
        res.send({
            message : "Password update successfully Please Login Again"
        }) 
    } catch (error) {
        res.status(400).send("Error "+error)
    }
})

module.exports = profileRouter;