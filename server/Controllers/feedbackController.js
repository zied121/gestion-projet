const mongoose = require("mongoose");
const Feedback = require("../models/Feedback");
const { Blog } = require("../models/Blog");

//Fonction pour récupérer tous les feedbacks d'un blog
const getFeedbacksByBlog = async (req, res) => {
  try {

    const { blogId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({ message: "ID de blog invalide" });
    }

    // Recherche de tous les feedbacks liés à ce blog
    const feedbacks = await Feedback.find({ blog: blogId }).populate("user", "username");

    // Vérifie si aucun feedback n'est trouvé
    if (!feedbacks.length) {
      return res.status(404).json({ message: "Aucun feedback trouvé pour ce blog" });
    }

    res.json(feedbacks);
  } catch (err) {
    console.error("Erreur lors de la récupération des feedbacks :", err);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des feedbacks" });
  }
};

// Fonction pour récupérer un feedback par ID
const getFeedbackById = async (req, res) => {
  try {

    // Cherche le feedback dans la base de données par son ID
    const feedback = await Feedback.findById(req.params.id).populate("user", "username");

    if (!feedback) {
      return res.status(404).json({ message: "Feedback non trouvé" });
    }

    res.json(feedback);
  } catch (err) {

    console.error("Erreur lors de la récupération du feedback :", err);
    res.status(500).json({ message: "Erreur serveur lors de la récupération du feedback" });
  }
};

// Fonction pour ajouter un feedback sur un blog
const createFeedback = async (req, res) => {
  try {

    // Récupère le commentaire depuis le corps de la requête
    const { comment } = req.body;

    // Récupère l'ID du blog depuis les paramètres d'URL
    const { blogId } = req.params;

    // Vérifie si le commentaire est vide ou inexistant
    if (!comment || comment.trim() === "") {
      return res.status(400).json({ message: "Le commentaire est requis" });
    }

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({ message: "ID de blog invalide" });
    }

    // Vérifie que le blog existe
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog non trouvé" });
    }

    // Crée un nouveau document Feedback avec :
    const newFeedback = new Feedback({
      blog: blogId,
      user: req.user.id,
      comment,
    });

    // Enregistre le feedback dans la base de données
    await newFeedback.save();
    res.status(201).json({ message: "Feedback créé avec succès", feedback: newFeedback });
  } catch (err) {
    console.error("Erreur lors de la création du feedback :", err);
    res.status(500).json({ message: "Erreur serveur lors de la création du feedback" });
  }
};

// Fonction pour modifier un feedback
const updateFeedback = async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment || comment.trim() === "") {
      return res.status(400).json({ message: "Le commentaire est requis" });
    }
    const updatedFeedback = await Feedback.findByIdAndUpdate(req.params.id, { comment }, { new: true });
    if (!updatedFeedback) {
      return res.status(404).json({ message: "Feedback non trouvé" });
    }
    res.json({ message: "Feedback mis à jour avec succès", feedback: updatedFeedback });
  } catch (err) {
    console.error("Erreur lors de la mise à jour du feedback :", err);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour du feedback" });
  }
};

//Fonction pour supprimer un feedback
const deleteFeedback = async (req, res) => {
  try {
    const deletedFeedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!deletedFeedback) {
      return res.status(404).json({ message: "Feedback non trouvé" });
    }
    res.json({ message: "Feedback supprimé avec succès !" });
  } catch (err) {
    console.error("Erreur lors de la suppression du feedback :", err);
    res.status(500).json({ message: "Erreur serveur lors de la suppression du feedback" });
  }
};

module.exports = {
  getFeedbacksByBlog,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
};
