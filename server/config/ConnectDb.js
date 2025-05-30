const mongoose = require('mongoose');
require("dotenv").config();


const URL= 'mongodb://127.0.0.1:27017/test';

const connectDb = async () => {

    try {
        await mongoose.connect(URL);
        console.log('MongoDB Connected');


    } catch (error) {
        console.log("MongoDB Connected Error", error);
    }


};
module.exports = connectDb;