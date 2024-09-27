const express = require('express');
const PORT = 3000;
const app = express();
const dbConnect = require('./config/database');
const User = require('./models/user');
const {validateSignUpData} = require('./utils/validation');
const bcrypt = require('bcrypt');
const validator = require('validator');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');


// parse the JSON obj which comes from client.
app.use(express.json());
app.use(cookieParser());


app.post('/signup', async (req,res,next) => {
    const {firstName, lastName, emailId, password} = req.body;

    try {
        validateSignUpData(req);

        // Encrypt the password
        let hashedPassword = await bcrypt.hash(password, 10)

        const user = new User({
            firstName, lastName, emailId, password: hashedPassword
        });
        await user.save();
        res.send('User save successfully') 
    } catch (error) {
        res.status(400).send("Error saving the user data "+error)
    }
})

// Get a user
app.get('/user', async (req,res,next) => {
    try {
        let email = req.body.emailId;

        let user = await User.findOne({emailId: email});

        if(user){
            res.send(user) 
        } else {
            res.status(404).send("user not found")
        }
    } catch (error) {
        res.status(400).send("Error fetching a the user data")
    }
})

// Get All user
app.get('/feed', async (req,res,next) => {
    try {
        let user = await User.find({});

        if(user){
            res.send(user) 
        } else {
            res.status(404).send("user not found")
        } 
    } catch (error) {
        res.status(400).send("Error fetching the user data")
    }
})

// Get user profile
app.get('/profile', async (req,res,next) => {
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

        if(user){
            res.send(user) 
        } else {
            res.status(404).send("user not found")
        }
    } catch (error) {
        res.status(400).send("Error fetching the user data "+error)
    }
})

// Delete a user
app.delete('/user', async (req,res,next) => {
    try {
        let userId = req.body.userId;
        let user = await User.findByIdAndDelete(userId);
        
        res.send("user deleted successfully")
        
    } catch (error) {
        res.status(400).send("Error in user delete")
    }
})

// Update a user
app.patch('/user/:userId', async (req,res,next) => {
    try {
        let userId = req?.params.userId;
        let data = req.body;

        const ALLOWED_INPUTS = ["age", "gender", "photoUrl", "about", "skills"];

        const isAllowed = Object.keys(data).every((el) => ALLOWED_INPUTS.includes(el));
        if(!isAllowed){
            throw new Error("Some data are not allowed to update")
        }

        if(data?.skills.length > 10){
            throw new Error("Can update max 10 skills")
        }

        let user = await User.findByIdAndUpdate(userId, data, {new: true, runValidators: true});
 
        res.send("user updated successfully");
    } catch (error) {
        res.status(400).send("VALIDATION ERROR " + error)
    }
})

app.post('/login', async (req,res,next) => {
    const { emailId, password} = req.body;

    try {
        if(!validator.isEmail(emailId)){
            throw new Error("Email is not Valid") 
        }

        let user = await User.findOne({emailId});
        if(!user){
            throw new Error("Email is not present in DB") 
        }

        let isValidPassword = await bcrypt.compare(password, user.password);

        if(isValidPassword){

            // create JWT token
            const token = jwt.sign({ _id: user.id }, '#devTinder@123');
            res.cookie('token', token)

            res.send('Login successfully') 
        } else {
            throw new Error("Invalid credential") 
        }
    } catch (error) {
        res.status(400).send("ERROR s"+error)
    }
})

dbConnect()
    .then(() => {
        console.log("Database connected successfully...");

        app.listen(PORT, () => {
            console.log(`server is running on port ${PORT}`);
        })
    })
    .catch((e) => {
        console.log("Error in Database connection");
    })