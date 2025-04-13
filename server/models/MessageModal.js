const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "utilisateur",
    required: true,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  file: {
    type: String,
    default: null,
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  }, 
  UpdatedAt: {
    type: Date,
    default: null,
  }
});

module.exports = mongoose.model("Message", messageSchema);
