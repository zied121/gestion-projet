const { Message } = require("../models/MessageModal");
const { Room } = require("../models/Room");
const { User }= require("../models/Usermodel");
const mongoose = require("mongoose");
const io = require('../index');
/* functional create const createMessage = (io) => async (req, res) => {

//const createMessage = async (req, res) => {
  try {
    const { room, content, file } = req.body;
    const sender = req.user._id; 
console.log(sender)
    const existingRoom = await Room.findById(room);
    if (!existingRoom) {
      return res.status(404).json({ message: "Room non trouvée." });
    }

    const message = new Message({
      sender,
      room,
      content,
      file: file || null,
    });

    const savedMessage = await message.save();
    const io = req.app.get('io');

    io.to(room).emit('receiveMessage', savedMessage);
    console.log(savedMessage)
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Erreur lors de la création du message :", error);
    res.status(500).json({ message: "Erreur serveur lors de l'envoi du message." });
  }
};
const createMessage = (io) => async (req, res) => {*/

//create message websocket

const createMessageWS = async (req, res) => {
  try {
    const { room, content } = req.body;
    const file = req.file; 
    const sender = req.user?._id; 

     const SenderName = req.user?.nom; // Optional chaining to avoid crash

    console.log('Sender ID:', SenderName);

    //console.log('Sender ID:', sender);
    const existingRoom = await Room.findById(room);
    if (!existingRoom) {
      return res.status(404).json({ message: "Room non trouvée." });
    }

    const message = new Message({
      sender,
      SenderName: SenderName,
      room,
      content,
    file: file ? file.filename : null

    });

    const savedMessage = await message.save();
    //const populatedMessage = await savedMessage.populate('sender', 'nom');  
const io = req.app.get('io');
io.to(room).emit('receiveMessage', savedMessage);
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Erreur lors de la création du message :", error);
    res.status(500).json({ message: "Erreur serveur lors de l'envoi du message." });
  }
};

const createMessage = async (req, res) => {
  try {
    const { room, content } = req.body;
    console.log('req userrrr :', req.user);

    const sender = req.user?._id; // Optional chaining to avoid crash
      const senderNom = req.user?.nom; // Optional chaining to avoid crash

    console.log('Sender ID:', senderNom);
    const file = req.file;

    const existingRoom = await Room.findById(room);
    if (!existingRoom) {
      return res.status(404).json({ message: "Room non trouvée." });
    }

    const message = new Message({
      sender,
      room,
      content,
      file: file ? file.filename : null
    });

    const savedMessage = await message.save();

    /*Emit to room via WebSocket
    io.to(room).emit('receiveMessage', savedMessage);
    console.log('Message envoyé via WebSocket:', savedMessage);
*/
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Erreur lors de la création du message :", error);
    res.status(500).json({ message: "Erreur serveur lors de l'envoi du message." });
  }
};


/*
const getMessagesByRoom = async (req, res) => {
    try {
      const roomId = req.params.id;
        if (!roomId) {
        return res.status(400).json({ message: "ID de la room invalide" });
      }
        const messages = await Message.find({ room: roomId });
      if (!messages || messages.length === 0) {
        return res.status(404).json({ message: "Aucun message trouvé pour cette room" });
      }
  
      res.status(200).json(messages);
    } catch (error) {
      console.error("Erreur récupération messages de la room :", error);
      res.status(500).json({ message: 'Erreur récupération messages de la room', error: error.message });
    }
  };
 */
  const getMessagesByRoom = async (req, res) => {
    try {
      const roomId = req.params.id;
      if (!roomId) {
        return res.status(400).json({ message: "ID de la room invalide" });
      }
  
      const messages = await Message.find({ room: roomId });
      if (!messages || messages.length === 0) {
        return res.status(404).json({ message: "Aucun message trouvé pour cette room" });
      }
  
      res.status(200).json(messages);
    } catch (error) {
      console.error("Erreur récupération messages de la room :", error);
      res.status(500).json({ message: 'Erreur récupération messages de la room', error: error.message });
    }
  };
  




  /*
  const updateMessage = async (req, res) => {
    try {
      const message = await Message.findById(req.params.id);
      if (!message) return res.status(404).json({ message: 'Message non trouvé' });
  
      // Optionnel : vérifier si req.user._id === message.sender pour autoriser la modif
      message.content = req.body.content || message.content;
      const updated = await message.save();
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Erreur mise à jour', error });
    }
  };*//*
  const updateMessage = async (req, res) => {
    try {
      const room = req.body.room;
      const existingRoom = await Room.findById(room);
      if (!existingRoom) {
        return res.status(404).json({ message: 'Room non trouvée!!!!!' });
      }
      const message = await Message.findById(req.params.id)//.populate('sender', 'nom'); // utile pour le frontend
      if (!message) {
        return res.status(404).json({ message: 'Message non trouvé' });
      }
  
       if (req.user._id.toString() !== message.sender.toString()) {
       return res.status(403).json({ message: "Non autorisé" });
      }
      message.content = req.body.content || message.content;
      const updated = await message.save();
      const io = req.app.get('io');
      //io.to(existingRoom).emit('messageUpdated', updated);
      io.to(existingRoom._id.toString()).emit('messageUpdated', updated);
      console.log('Message updated:', updated);
      res.json(updated);
    } catch (error) {
      console.error('Erreur mise à jour du message :', error);
      res.status(500).json({ message: 'Erreur mise à jour', error: error.message });
    }
  };
  */
  const updateMessage = async (req, res) => {
    try {
      const message = await Message.findById(req.params.id); //.populate('sender', 'nom');
      if (!message) {
        return res.status(404).json({ message: 'Message non trouvé' });
      }
  
      const existingRoom = await Room.findById(message.room); // ✅ récupère la room depuis le message
      if (!existingRoom) {
        return res.status(404).json({ message: 'Room non trouvée' });
      }
  
      if (req.user._id.toString() !== message.sender.toString()) {
        return res.status(403).json({ message: "Non autorisé" });
      }
  
      message.content = req.body.content || message.content;
      const updated = await message.save();
      const io = req.app.get('io');
      io.to(existingRoom._id.toString()).emit('messageUpdated', updated);
      console.log('Message updated:', updated);
      res.json(updated);
    } catch (error) {
      console.error('Erreur mise à jour du message :', error);
      res.status(500).json({ message: 'Erreur mise à jour', error: error.message });
    }
  };
  
  /*const deleteMessage = async (req, res) => {
    try {
      const message = await Message.findByIdAndDelete(req.params.id);
      if (!message) return res.status(404).json({ message: 'Message non trouvé' });
      res.json({ message: 'Message supprimé' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur suppression', error });
    }
  };*/

  const deleteMessage = async (req, res) => {
    try {
      const messageId = req.params.id;
      const message = await Message.findByIdAndDelete(messageId);
  
      if (!message) {
        return res.status(404).json({ message: "Message non trouvé" });
      }
  
      // Émettre l’événement via WebSocket
      const io = req.app.get('io');
      if (io) {
        io.to(message.room.toString()).emit('messageDeleted', message._id);
      }
  
      res.status(200).json({ message: "Message supprimé", id: message._id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  /*
  const pinMessage = async (req, res) => {
    try {
      const message = await Message.findById(req.params.id);
  
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      message.isPinned = !message.isPinned;
      await message.save();
      res.status(200).json({ message: "Pin status updated", isPinned: message.isPinned });
    } catch (error) {
      console.error("Erreur lors du pin/unpin :", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };*/
const pinMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Toggle the pin status
    message.isPinned = !message.isPinned;
    await message.save();

    // Fetch the updated message (like in toggleLikeMessage)
    const updated = await Message.findById(messageId);

    // Emit the update via socket (like in toggleLikeMessage)
    const io = req.app.get('io');
    if (io) {
      io.to(message.room.toString()).emit('messageUpdated', updated);
    }

    // Return the full updated message object (like in toggleLikeMessage)
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error during pin/unpin:", error);
    res.status(500).json({ message: "Server error" });
  }
};
  const toggleLikeMessage = async (req, res) => {
    try {
      const messageId = req.params.id;
      const userId = req.user._id; 
      console.log('User ID:', userId);
      const message = await Message.findById(messageId);
      if (!message) return res.status(404).json({ message: 'Message non trouvé' });
  
      const alreadyLiked = message.likes.includes(userId);
  
      if (alreadyLiked) {
        message.likes.pull(userId);
      } else {
        message.likes.push(userId);
      }
  
      await message.save();
  
      const updated = await Message.findById(messageId)
  
      const io = req.app.get('io');
      if (io) {
        io.to(message.room.toString()).emit('messageUpdated', updated);
      }
  
      res.status(200).json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  

  
  
  module.exports = {
    createMessage,
    updateMessage,
    deleteMessage,
    getMessagesByRoom,
    pinMessage,
    createMessageWS,
    toggleLikeMessage,
  };