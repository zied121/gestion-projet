const Message = require('../models/MessageModal');
const Room = require('../models/Room');

// ✅ Créer un message
const createMessage = async (req, res) => {
  const { room, content } = req.body;
  const file = req.file;

  if (!room || !content) {
    return res.status(400).json({ message: 'Room et contenu sont requis.' });
  }

  try {
    const roomExists = await Room.findById(room);
    if (!roomExists) {
      return res.status(404).json({ message: 'Room non trouvée.' });
    }

    const message = new Message({
      sender: req.user._id,
      room,
      content,
      file: file?.filename || null,
    });

    const savedMessage = await message.save();

    // ✅ Émettre le message à tous les membres connectés à cette room
    const io = req.app.get('io');
    io.to(room).emit('receiveMessage', savedMessage);

    res.status(201).json(savedMessage);
  } catch (err) {
    console.error('Erreur création message :', err.message);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// ✅ Récupérer les messages d'une room
const getMessagesByRoom = async (req, res) => {
  const { id: roomId } = req.params;

  try {
    const messages = await Message.find({ room: roomId })
        .populate('sender', 'nom email')
        .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error('Erreur récupération messages :', err.message);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// ✅ Mettre à jour un message
const updateMessage = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'Contenu requis pour la mise à jour.' });
  }

  try {
    const updated = await Message.findByIdAndUpdate(
        id,
        { content },
        { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Message non trouvé.' });
    }

    res.status(200).json(updated);
  } catch (err) {
    console.error('Erreur update message :', err.message);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// ✅ Supprimer un message
const deleteMessage = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Message.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Message non trouvé.' });
    }

    res.status(200).json({ message: 'Message supprimé avec succès.' });
  } catch (err) {
    console.error('Erreur suppression message :', err.message);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// ✅ Épingler ou désépingler un message
const pinMessage = async (req, res) => {
  const { id } = req.params;

  try {
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé.' });
    }

    message.isPinned = !message.isPinned;
    await message.save();

    res.status(200).json({ message: 'État de l’épingle mis à jour.', pinned: message.isPinned });
  } catch (err) {
    console.error('Erreur épinglage message :', err.message);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

module.exports = {
  createMessage,
  getMessagesByRoom,
  updateMessage,
  deleteMessage,
  pinMessage,
};
