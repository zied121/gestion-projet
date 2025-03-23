const express = require('express');
const router = express.Router();


const {

    login,
    signup,
    forgetPassword,

} = require("../Controllers/authController");


router.post("/forget", forgetPassword);
router.post("/login", login)
router.post ("/signup",signup)
module.exports = router;