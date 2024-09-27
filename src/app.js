const express = require('express');
const PORT = 3000;
const app = express();
const dbConnect = require('./config/database');

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