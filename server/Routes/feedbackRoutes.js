const Blog = require("../models/Blog");
const express = require("express");
const {
  getFeedbacksByBlog,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback
} = require("../controllers/feedbackController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Récupérer tous les feedbacks d'un blog
router.get("/blog/:blogId", getFeedbacksByBlog);

// Récupérer un feedback par ID
router.get("/:id", getFeedbackById);

// Ajouter un feedback (auth requis)
router.post("/blog/:blogId", authMiddleware, createFeedback);

// Modifier un feedback (auth requis)
router.put("/:id", authMiddleware, updateFeedback);

// Supprimer un feedback (auth requis)
router.delete("/:id", authMiddleware, deleteFeedback);

module.exports = router;
