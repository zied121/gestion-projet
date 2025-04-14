const express = require('express');
const router = express.Router();
const isauth = require('../Middleware/isauth');
const upload = require('../Middleware/upload');

const {
    createMessage,
    getAllMessages,
    getMessageById,
    deleteMessage,
    getMessagesByRoom,
    pinMessage,
    updateMessage
} = require("../Controllers/MessageController");

// ✅ Créer un message (avec upload + auth)
router.post('/createMsg', isauth, upload.single('file'), createMessage);

// ✅ Mettre à jour un message
router.put('/updateMsg/:id', isauth, updateMessage);

// ✅ Supprimer un message
router.delete('/deleteMsg/:id', isauth, deleteMessage);

// ✅ Épingler un message
router.patch('/pinMsg/:id', isauth, pinMessage);

// ✅ Récupérer les messages d'une room
router.get('/getMessagesByRoom/:id', isauth, getMessagesByRoom);

// 🔄 (Optionnel) Routes supplémentaires si besoin plus tard :
/*
router.get('/', getAllMessages);
router.get('/:id', isauth, getMessageById);
*/

module.exports = router;
