const express = require('express');
const router = express.Router();
const isAuth = require("../Middleware/isauth");
const isAdmin = require("../Middleware/adminorganisation");

const {

    createUser,
    getOneUser,
    deleteUser,
    updateUser,

} = require("../Controllers/userController");

router.post("/add/:organisationId",isAuth,isAdmin, createUser)
router.delete("/delete/:organisationId/:id", isAuth,isAdmin, deleteUser)
router.put("/update/:organisationId/:id", isAuth,isAdmin, updateUser)


//get connteted user data
router.get("/getone", isAuth, getOneUser)
module.exports = router;