const express = require('express');
const router = express.Router();
const isauth = require('../Middleware/isauth');
const { io } = require('../index');
const upload = require('../Middleware/upload');

const {
    createMessage, getAllMessages,getMessageById , deleteMessage , getMessagesByRoom , pinMessage , updateMessage
} = require("../Controllers/MessageController");
//router.post('/createMsg', createMessage(io));

router.post('/createMsg',isauth, upload.single('file'),  createMessage);
router.put('/updateMsg/:id', isauth, updateMessage);
router.delete('/deleteMsg/:id', isauth, deleteMessage);
router.patch('/pinMsg/:id', pinMessage); //one attribute
router.get('/getMessagesByRoom/:id', getMessagesByRoom);

/*
router.get('/', getAllMessages);
router.get('/:id', isauth, getMessageById);
router.put('/:id', isauth, updateMessage);
router.get('/:roomId', getMessagesByRoom);
*/
module.exports = router;
