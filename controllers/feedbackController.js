const Feedback = require("../models/Feedback");

//Récupérer tous les feedbacks d'un blog
exports.getFeedbacksByBlog = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ blog: req.params.blogId }).populate("user", "username");
    res.json(feedbacks);
  } catch (err) {
    console.error("Erreur lors de la récupération des feedbacks :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

//Récupérer un feedback par ID
exports.getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id).populate("user", "username");
    if (!feedback) {
      return res.status(404).json({ message: "Feedback non trouvé" });
    }
    res.json(feedback);
  } catch (err) {
    console.error("Erreur lors de la récupération du feedback :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

//Ajouter un feedback sur un blog
exports.createFeedback = async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment) {
      return res.status(400).json({ message: "Le commentaire est requis" });
    }

    const newFeedback = new Feedback({ 
      blog: req.params.blogId, 
      user: req.user.id, 
      comment 
    });

    await newFeedback.save();
    res.status(201).json(newFeedback);
  } catch (err) {
    console.error("Erreur lors de la création du feedback :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

//Modifier un feedback
exports.updateFeedback = async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment) {
      return res.status(400).json({ message: "Le commentaire est requis" });
    }

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { comment },
      { new: true }
    );

    if (!updatedFeedback) {
      return res.status(404).json({ message: "Feedback non trouvé" });
    }

    res.json(updatedFeedback);
  } catch (err) {
    console.error("Erreur lors de la mise à jour du feedback :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

//Supprimer un feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const deletedFeedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!deletedFeedback) {
      return res.status(404).json({ message: "Feedback non trouvé" });
    }
    res.json({ message: "Feedback supprimé avec succès !" });
  } catch (err) {
    console.error("Erreur lors de la suppression du feedback :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
