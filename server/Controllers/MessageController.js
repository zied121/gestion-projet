const Message = require("../models/MessageModal");
const { Room } = require("../models/Room");
const io = require('../index');

const createMessage = async (req, res) => {
  try {
    const { room, content, file } = req.body;
    const sender = req.user._id; 

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
    io.to(room).emit('receiveMessage', savedMessage);
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Erreur lors de la création du message :", error);
    res.status(500).json({ message: "Erreur serveur lors de l'envoi du message." });
  }
};

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
  };

  const deleteMessage = async (req, res) => {
    try {
      const message = await Message.findByIdAndDelete(req.params.id);
      if (!message) return res.status(404).json({ message: 'Message non trouvé' });
      res.json({ message: 'Message supprimé' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur suppression', error });
    }
  };

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
  };
  
  
  module.exports = {
    createMessage,
    updateMessage,
    deleteMessage,
    getMessagesByRoom,
    pinMessage,
  };