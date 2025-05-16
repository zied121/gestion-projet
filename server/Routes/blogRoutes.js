const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Vérification/Création sécurisée du dossier d'upload
const uploadDir = path.join(__dirname, '..', 'uploads', 'blog-images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Configuration Multer améliorée (conservant votre structure)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées (jpeg, png, etc.)'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Import des contrôleurs (inchangé)
const {
  getBlogs,
  getBlogsPaginated,
  getCommentsPaginated,
  likeBlog,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  addComment,
  updateComment,
  deleteComment,
  getRecommendedBlogs,
  getPopularBlogs,
  addTagsToBlog
} = require("../Controllers/blogController");

// Routes publiques (inchangées)
router.get("/", getBlogsPaginated);
router.get("/popular", getPopularBlogs);
router.get("/:id", getBlogById);
router.get("/:id/recommendations", getRecommendedBlogs);
router.get("/:blogId/comments", getCommentsPaginated);

// Routes protégées (commentaire conservé)
//router.use(authMiddleware);

// Gestion des commentaires (inchangée)
router.post("/:blogId/comments", addComment);
router.put("/:blogId/comments/:commentId", updateComment);
router.delete("/:blogId/comments/:commentId", deleteComment);

// Gestion des likes et tags (inchangée)
router.post("/like/:id", likeBlog);
router.put('/:id/tags', addTagsToBlog);

// Gestion des blogs (CRUD) - Middleware d'upload ajouté
const handleFileUpload = (req, res, next) => {
  upload.single('imageFile')(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ 
        error: true,
        message: err.message 
      });
    } else if (err) {
      return res.status(500).json({ 
        error: true,
        message: err.message 
      });
    }
    next();
  });
};

router.post("/", handleFileUpload, createBlog);
router.put("/:id", handleFileUpload, updateBlog);
router.delete("/:id", deleteBlog);

module.exports = router;