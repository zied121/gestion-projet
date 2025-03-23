const express = require('express');
const router = express.Router();
const isAuth = require("../Middleware/isauth");

const {

    createUser,
    getOneUser,
    deleteUser,
    updateUser

} = require("../Controllers/userController");

router .post("/register",isAuth, createUser)
router.delete("/profile", isAuth, deleteUser)
router.put("/profile", isAuth, updateUser)
router.get("/profile", isAuth, getOneUser)
module.exports = router;