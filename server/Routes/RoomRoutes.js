const express = require("express");
const router = express.Router();
const isAuth = require("../Middleware/isauth");
const isAdmin = require("../Middleware/adminorganisation");
const authMiddleware = require("../Middleware/isauth");
const validate = require('../Middleware/validate');
const { ValideRoomSchema } = require("../models/Room");
const upload = require("../Middleware/upload");

const {
    getRooms,searchRooms,getRoomsByUser, getRoomsByOwner,getRoomById,deleteRoom , createRoom , getProjectPerUser, createGoogleMeet , getAllRooms,updateRoom , createRoomPerProject, createPrivateRoom
} = require("../Controllers/roomController");
  
//Admin routes
//router.post("/addRoom", isAuth,isAdmin, createRoom)
//router.put("/UpdateRoom", isAuth,isAdmin, updateRoom)
//router.get("/", isAuth, getRooms)
router.get("/",isAuth, getRooms)
router.get("/allrooms",isAuth, getAllRooms)
router.get("/getProjectPerUser", isAuth, getProjectPerUser)  
router.get("/getRoomByID/:id",isAuth, getRoomById)  
router.post("/addRoom" , isAuth ,validate(ValideRoomSchema), createRoom)
router.post("/RoomForProject/:id" , isAuth, upload.single('image') ,validate(ValideRoomSchema), createRoomPerProject)
router.post('/CreatePrivateRoom', isAuth, createPrivateRoom); 
///router.post("/addRoom" , isAuth , validate(valideRoomSchema) , createRoom) 
router.put("/UpdateRoom/:id" , isAuth, upload.single('image'), updateRoom)
router.delete("/DeleteRoom/:id", isAuth, deleteRoom)
router.post('/:id/start-call', createGoogleMeet);
router.get('/searchRoom',isAuth , searchRooms);
router.get('/getRoomsPerUser', isAuth, getRoomsByUser);
router.get("/getRoomsPerowner", isAuth, getRoomsByOwner);
router.get('/getRoomUsers/:id', isAuth, getRoomUsers);
//User routes
module.exports = router;