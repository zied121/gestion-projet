const mongoose = require("mongoose");


// Définition du schéma de feedback
const FeedbackSchema = new mongoose.Schema({
  blog: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true }, // Référence au modèle "Blog"

  // Référence à l'utilisateur ayant laissé le feedback
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Contenu du commentaire du feedback
  comment: { type: String, required: true },

  // Date de création du feedback (automatiquement définie à la date actuelle)
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Feedback", FeedbackSchema);
