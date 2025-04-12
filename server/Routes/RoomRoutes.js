const express = require("express");
const router = express.Router();
const isAuth = require("../Middleware/isauth");
const isAdmin = require("../Middleware/adminorganisation");
const authMiddleware = require("../Middleware/isauth");
const  valideRoomSchema = require("../models/Room");
const validate = require ("../Middleware/validate");
const {
    getRooms, getRoomById,deleteRoom , createRoom , getProjectPerUser, createGoogleMeet , updateRoomsec , createRoomPerProject
} = require("../Controllers/roomController");

//Admin routes
//router.post("/addRoom", isAuth,isAdmin, createRoom)
//router.put("/UpdateRoom", isAuth,isAdmin, updateRoom)
//router.get("/", isAuth, getRooms)
router.get("/", getRooms)  
router.get("/getProjectPerUser", isAuth, getProjectPerUser)  
router.get("/getRoomByID/:id", isAuth, getRoomById)  
router.post("/addRoom" , isAuth , createRoom) 
router.post("/RoomForProject/:id" , isAuth , createRoomPerProject) 
///router.post("/addRoom" , isAuth , validate(valideRoomSchema) , createRoom) 
router.put("/UpdateRoom/:id" , isAuth , updateRoomsec) 
router.delete("/DeleteRoom/:id", isAuth, deleteRoom)
router.post('/:id/start-call', createGoogleMeet);



//User routes
module.exports = router;