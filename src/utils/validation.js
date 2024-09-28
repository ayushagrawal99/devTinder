const validator = require('validator');

const validateSignUpData = (req) => {
    const {firstName, lastName, emailId, password} = req.body;

    if(!firstName || !lastName){
        throw new Error("Name is not Valid")
    }
    else if(!validator.isEmail(emailId)){
        throw new Error("Email is not Valid") 
    }
    else if(!validator.isStrongPassword(password)){
        throw new Error("password is not Valid") 
    }
}

const validateEditUserData = (req) => {
    const data = req.body;

    const VALID_UPDATE = ["firstName", "lastName", "gender", "age", "about", "skills", "photoUrl"];
    
    let isValidUpdate = Object.keys(data).every((el) => VALID_UPDATE.includes(el));

    if(!isValidUpdate){
        throw new Error("Not Allowed to update fields")
    }

    // TODO we can validate each fields
    return;
}

module.exports = {
    validateSignUpData,
    validateEditUserData
};