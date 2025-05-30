const mongoose = require("mongoose");
const yup = require("yup");

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
  SenderName: {
    type: String,
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
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "utilisateur",
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  }, 
  UpdatedAt: {
    type: Date,
    default: null,
  }
});

//module.exports = mongoose.model("Message", messageSchema);

const ValideMsgSchema = yup.object({
  //content: yup.string().required("write a message to send").min(1, "write a message to send"),
  file: yup.string().url("L'URL de l'image n'est pas valide").nullable(),
});
const Message = mongoose.model("Messages", messageSchema);
module.exports = {Message, ValideMsgSchema};

