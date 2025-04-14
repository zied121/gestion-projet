const express = require('express');
const router = express.Router();


const {

    login,
    signup,
    forgetPassword,
    verifyOtp,


} = require("../Controllers/authController");


router.post("/forget", forgetPassword);
router.post("/verify-otp", verifyOtp);
router.post("/login", login)
router.post ("/signup",signup)
module.exports = router;