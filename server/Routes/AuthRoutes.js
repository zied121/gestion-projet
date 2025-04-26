const express = require('express');
const router = express.Router();


const {

    login,
    signup,
    forgetPassword,
    verifyOtp,
    googleLogin,
    googleRegister

} = require("../Controllers/authController");


router.post("/forget", forgetPassword);
router.post("/verify-otp", verifyOtp);
router.post("/login", login)
router.post ("/signup",signup)
router.post("/google-login", googleLogin)
router.post("/google-register", googleRegister)

module.exports = router;