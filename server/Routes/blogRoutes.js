const express = require("express");
const router = express.Router();
const { addComment } = require("../Controllers/blogController");

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
    deleteComment,
    getRecommendedBlogs,
    getPopularBlogs,
    addTagsToBlog

    
} = require("../Controllers/blogController");


const authMiddleware = require("../middleware/authMiddleware");    //	Pour protéger les routes qui nécessitent un utilisateur connecté

// 🔹 Blogs les plus likés
router.get("/popular", getPopularBlogs);

// 🔹 Blogs similaires (tags en commun)
router.get("/:id/recommendations", getRecommendedBlogs);

// 🔹 Route pour ajouter un commentaire à un blog (auth requis)
router.post("/:blogId/comments", authMiddleware, addComment);

// 🔹 Récupérer tous les blogs (avec pagination)
router.get("/", getBlogsPaginated);

// 🔹 Route pour récupérer les comments d'un blog avec pagination 
router.get("/:blogId/comments", getCommentsPaginated);

// 🔹 Route pour modifier un commentaire
router.put("/:blogId/comments/:commentId", authMiddleware, updateComment);

// 🔹 Route pour supprimer un commentaire
router.delete("/:blogId/comments/:commentId", authMiddleware, deleteComment);

// Ajouter des tags à un blog spécifique
router.put('/:id/tags', addTagsToBlog); // Route PUT pour ajouter des tags

// 🔹 Route pour liker un blog (auth requis)
router.post("/like/:blogId", authMiddleware, likeBlog);

// 🔹 Récupérer un blog par ID
router.get("/:id", getBlogById);


// 🔹 Créer, modifier, supprimer un blog
router.post("/", authMiddleware, createBlog);
router.put("/:id", authMiddleware, updateBlog);
router.delete("/:id", authMiddleware, deleteBlog);





module.exports = router;




