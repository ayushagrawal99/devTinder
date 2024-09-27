const mongoose = require('mongoose');
const validator = require('validator');

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
        validate(value){
            if(!["male", "female", "others"].includes(value)){
                throw Error("this gender is not allowed ", value)
            }
        }
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

const User = mongoose.model('User', userSchema);
module.exports = User;