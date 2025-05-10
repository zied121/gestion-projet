const express = require('express');
const router = express.Router();
const isauth = require('../Middleware/isauth');
const { io } = require('../index');
const upload = require('../Middleware/upload');
const validate = require('../Middleware/validate');
const { messageValidationSchema } = require('../models/MessageModal');
const {
    createMessage , getAllMessages,getMessageById , createMessageWS, deleteMessage , getMessagesByRoom , pinMessage , updateMessage, toggleLikeMessage,

} = require("../Controllers/MessageController");
router.post('/createMsgWS', isauth, upload.single('file'),validate(messageValidationSchema), createMessageWS);
//router.post('/createMsg',isauth, upload.single('file'),  createMessage);
router.put('/updateMsg/:id', isauth,validate(messageValidationSchema), updateMessage);
router.delete('/deleteMsg/:id', isauth, deleteMessage);
router.patch('/pinMsg/:id', pinMessage); //one attribute
router.get('/getMessagesByRoom/:id', getMessagesByRoom);
router.patch('/toggleLike/:id', isauth, toggleLikeMessage);


/*
router.get('/', getAllMessages);
router.get('/:id', isauth, getMessageById);
router.put('/:id', isauth, updateMessage);
router.get('/:roomId', getMessagesByRoom);
router.get('/:id', isauth, getMessageById);
*/
module.exports = router;
