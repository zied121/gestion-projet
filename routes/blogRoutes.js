const express = require("express");
const router = express.Router();

const {
    getBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog
} = require("../controllers/blogController");

const authMiddleware = require("../middlewares/authMiddleware");
const blogController = require('../controllers/blogController');

// 🔹 Récupérer tous les blogs
router.get("/", getBlogs);

// 🔹 Récupérer un blog par ID (auth optionnelle)
router.get("/:id", getBlogById);

// 🔹 Ajouter un blog (auth requis)
router.post("/", authMiddleware, createBlog);

// 🔹 Modifier un blog (auth requis)
router.put("/:id", authMiddleware, updateBlog);

// 🔹 Supprimer un blog (auth requis)
router.delete("/:id", authMiddleware, deleteBlog);

// Route pour ajouter un commentaire à un blog
router.post('/:blogId/comments', authMiddleware, blogController.addComment);

// Route pour récupérer les commentaires d'un blog (GET)
router.get('/:blogId/comments', authMiddleware, blogController.getComments);

// Route pour modifier un commentaire
router.put('/:blogId/comments/:commentId', authMiddleware, blogController.updateComment);

// Route pour supprimer un commentaire
router.delete('/:blogId/comments/:commentId', authMiddleware, blogController.deleteComment);


module.exports = router;
