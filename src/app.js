const express = require('express');
const PORT = 3000;
const app = express();
const dbConnect = require('./config/database');
const User = require('./models/user');

// parse the JSON obj which comes from client.
app.use(express.json());

app.post('/signup', async (req,res,next) => {
    const userObj = req.body;

    const user = new User(userObj);

    try {
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