const express = require('express');
const PORT = 3000;
const app = express();
const dbConnect = require('./config/database');
const cookieParser = require('cookie-parser');

// parse the JSON obj which comes from client.
app.use(express.json());
app.use(cookieParser());

let authRouter = require('./routes/auth');
let profileRouter = require('./routes/profile');
let requestRouter = require('./routes/request');

app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);

dbConnect()
    .then(() => {
        console.log("Database connected successfully...");

        app.listen(PORT, () => {
            console.log(`server is running on port ${PORT}`);
        })
    })
    .catch((e) => {
        console.log("Error in Database connection " + e);
    })