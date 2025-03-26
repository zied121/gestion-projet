const mongoose = require("mongoose");


//le schéma de commentaire
const CommentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // L'utilisateur qui a écrit le commentaire
  content: { type: String, required: true },  // Le contenu du commentaire
  createdAt: { type: Date, default: Date.now }  // Date de création
});

//le schéma de blog
const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  comments: [CommentSchema],   // Tableau de commentaires
  createdAt: { type: Date, default: Date.now },
  
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Liste des utilisateurs qui ont aimé
  likeCount: { type: Number, default: 0 },
});


module.exports = mongoose.model("Blog", BlogSchema);
