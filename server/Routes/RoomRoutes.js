const express = require("express");
const router = express.Router();
const isAuth = require("../Middleware/isauth");
const isAdmin = require("../Middleware/adminorganisation");
const authMiddleware = require("../Middleware/isauth");
const validate = require('../Middleware/validate');
const { ValideRoomSchema } = require("../models/Room");

const {
    getRooms,searchRooms,getRoomsByUser, getRoomById,deleteRoom , createRoom , getProjectPerUser, createGoogleMeet , updateRoomsec , createRoomPerProject, createPrivateRoom
} = require("../Controllers/roomController");
  
//Admin routes
//router.post("/addRoom", isAuth,isAdmin, createRoom)
//router.put("/UpdateRoom", isAuth,isAdmin, updateRoom)
//router.get("/", isAuth, getRooms)
router.get("/", getRooms)  
router.get("/getProjectPerUser", isAuth, getProjectPerUser)  
router.get("/getRoomByID/:id",isAuth, getRoomById)  
router.post("/addRoom" , isAuth ,validate(ValideRoomSchema), createRoom) 
router.post("/RoomForProject/:id" , isAuth ,validate(ValideRoomSchema), createRoomPerProject) 
router.post('/CreatePrivateRoom', isAuth, createPrivateRoom); 
///router.post("/addRoom" , isAuth , validate(valideRoomSchema) , createRoom) 
router.put("/UpdateRoom/:id" , isAuth ,validate(ValideRoomSchema), updateRoomsec) 
router.delete("/DeleteRoom/:id", isAuth, deleteRoom)
router.post('/:id/start-call', createGoogleMeet);
router.get('/searchRoom',isAuth , searchRooms);
router.get('/getRoomsPerUser', isAuth, getRoomsByUser);
//User routes
module.exports = router;