const express = require("express");
const router = express.Router();
const { addComment } = require("../controllers/blogController");

const {
    getBlogs,
    getBlogsPaginated,
    getCommentsPaginated,
    likeBlog,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    updateComment,
    deleteComment
} = require("../controllers/blogController");

const authMiddleware = require("../middlewares/authMiddleware");

// 🔹 Récupérer tous les blogs (avec pagination)
router.get("/", getBlogsPaginated);

// 🔹 Récupérer un blog par ID
router.get("/:id", getBlogById);

// 🔹 Ajouter un blog (auth requis)
router.post("/", authMiddleware, createBlog);

// 🔹 Modifier un blog (auth requis)
router.put("/:id", authMiddleware, updateBlog);

// 🔹 Supprimer un blog (auth requis)
router.delete("/:id", authMiddleware, deleteBlog);

// 🔹 Route pour ajouter un commentaire à un blog (auth requis)
router.post("/:blogId/comments", authMiddleware, async (req, res) => {
    try {
        const { blogId } = req.params;
        const { content } = req.body;

        // Appeler la fonction d'ajout de commentaire
        const newComment = await addComment(req, res);

        // Si le commentaire est ajouté avec succès, émettre la notification
        sendCommentNotification(blogId, newComment);

        // Répondre avec succès
        res.status(201).json({ message: "Commentaire ajouté avec succès", blog: newComment });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur lors de l'ajout du commentaire et de la notification" });
    }
});

// 🔹 Route pour récupérer les commentaires d'un blog avec pagination
router.get("/:blogId/comments", getCommentsPaginated);

// 🔹 Route pour modifier un commentaire
router.put("/:blogId/comments/:commentId", authMiddleware, updateComment);

// 🔹 Route pour supprimer un commentaire
router.delete("/:blogId/comments/:commentId", authMiddleware, deleteComment);

// 🔹 Route pour liker un blog (auth requis)
router.post("/like/:blogId", authMiddleware, likeBlog);

module.exports = router;
