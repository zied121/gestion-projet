const mongoose = require("mongoose");


//  Schéma pour un commentaire (sera intégré dans un blog)
const CommentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // L'utilisateur qui a écrit le commentaire
  content: { type: String, required: true },  // Le contenu du commentaire
  createdAt: { type: Date, default: Date.now }  // Date de création
});

//le schéma pour un blog
const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },          // Le titre du blog est obligatoire
  content: { type: String, required: true },      // Le contenu du blog est obligatoire
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },     // Référence vers l’auteur du blog
  comments: [CommentSchema],                        // Tableau de commentaires
  createdAt: { type: Date, default: Date.now },     // Date de création du blog

  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],       // Liste des utilisateurs qui ont aimé
  likeCount: { type: Number, default: 0 },                              // Compteur de likes, initialisé à 0
});


module.exports = mongoose.model("Blog", BlogSchema);
