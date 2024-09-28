const express = require('express');
const bcrypt = require('bcrypt');
const validator = require('validator');
const User = require('../models/user');
const {validateSignUpData} = require('../utils/validation');

const authRouter = express.Router();

authRouter.post('/signup', async (req,res,next) => {
    const {firstName, lastName, emailId, password} = req.body;

    try {
        validateSignUpData(req);

        // Encrypt the password
        let hashedPassword = await bcrypt.hash(password, 10)

        const user = new User({
            firstName, lastName, emailId, password: hashedPassword
        });
        await user.save();
        
        res.json({
            message : "User save successfully"
        })
    } catch (error) {
        res.status(400).send("Error saving the user data "+error)
    }
})

authRouter.post('/login', async (req,res,next) => {
    const { emailId, password} = req.body;

    try {
        if(!validator.isEmail(emailId)){
            throw new Error("Email is not Valid") 
        }

        let user = await User.findOne({emailId});
        if(!user){
            throw new Error("Email is not present in DB") 
        }

        let isValidPassword = await user.validatePassword(password);

        if(isValidPassword){

            // create JWT token
            const token = await user.getJWT();  // offload this function userschema methods
            res.cookie('token', token)

            res.json({
                message : "Login successfully'"
            }) 
        } else {
            throw new Error("Invalid credential") 
        }
    } catch (error) {
        res.status(400).send("ERROR "+error)
    }
})


authRouter.post('/logout', async (req,res,next) => {
    try {
        res.cookie('token', null, {
            expires: new Date(Date.now())
        })
       res.json({
        message : "Logout Successfully"
       })
    } catch (error) {
        res.status(400).send("ERROR "+error)
    }
})

module.exports = authRouter;