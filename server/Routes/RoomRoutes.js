const express = require("express");
const router = express.Router();
const isAuth = require("../Middleware/isauth");
const isAdmin = require("../Middleware/adminorganisation");
const authMiddleware = require("../Middleware/isauth");
const  valideRoomSchema = require("../models/Room");
const validate = require ("../Middleware/validate");
const {
    getRooms, getRoomById,deleteRoom , createRoom , getProjectPerUser
} = require("../Controllers/roomController");

//Admin routes
//router.post("/addRoom", isAuth,isAdmin, createRoom)
//router.put("/UpdateRoom", isAuth,isAdmin, updateRoom)
router.get("/", isAuth, getRooms)  
router.get("/getProjectPerUser", isAuth, getProjectPerUser)  

router.post("/addRoom" , isAuth , validate(valideRoomSchema) , createRoom) 
router.put("/UpdateRoom/:id" , isAuth , createRoom) 
router.delete("/DeleteRoom/:id", isAuth, deleteRoom)




//User routes
module.exports = router;