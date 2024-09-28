const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstName: {
        type : String,
        require: true,
        maxLength: 20,
        trim: true
    },
    lastName: {
        type : String,
        maxLength: 20,
        trim: true
    },
    emailId: {
        type : String,
        require: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw Error("Email ID format is Wrong "+ value)
            }
        }
    },
    password: {
        type : String,
        require: true,
        trim: true,
        validate(value) {
            if(!validator.isStrongPassword(value)){
                throw Error("Password is not strong "+ value)
            }
        }
    },
    age: {
        type : Number,
        min: 18
    },
    gender: {
        type : String,
        enum : {
            values: ["male", "female", "others"],
            message: `{VALUE} gender is not allowed`,
        },
    },
    photoUrl: {
        type : String,
        trim: true
    },
    about: {
        type : String,
        default: "This is default value",
        trim: true
    },
    skills: {
        type : [String]
    },
}, {
    timestamps: true
});

userSchema.methods.getJWT = async function () {
    let user = this; // it represent current instance of user

    let token = await jwt.sign({ _id: user.id }, '#devTinder@123', {expiresIn : '1h'});
    return token;
}

userSchema.methods.validatePassword = async function (inputUserPassword) {
    let user = this; // it represent current instance of user
    let hashedPassword = user.password;

    let isValidPassword = await bcrypt.compare(inputUserPassword, hashedPassword);
    return isValidPassword;
}

const User = mongoose.model('User', userSchema);
module.exports = User;