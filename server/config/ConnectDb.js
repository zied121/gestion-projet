const mongose = require('mongoose');
require("dotenv").config();
const connectDb = async () => {

    try {

        await mongose.connect(process.env.URL);
        console.log('MongoDB Connected');


    } catch (error) {
        console.log("MongoDB Connected Error", error);
    }


};
module.exports = connectDb;