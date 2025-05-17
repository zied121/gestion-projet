/** 
const mongoose = require('mongoose');
const { Blog, blogValidationSchema } = require('../models/Blog');
const User = require('../models/User');
const yup = require("yup");
const multer = require('multer');
const path = require('path');
const fs = require('fs');


//Fonction pour trouver un blog par ID
const findBlogById = async (blogId) => {
  //on va valider la validité de l'ID du blog
  if (!mongoose.Types.ObjectId.isValid(blogId)) {
    throw new Error("ID de blog invalide");
  }

  //on va rechercher le blog dans la BD par son ID
  const blog = await Blog.findById(blogId)
    .populate("author", "username email")                 // on va remplir les infors de l'auteur (nom d'utilisateur et email)
    .populate("comments.author", "username email");       // meme chose , remplir les informations de l'auteur des commentaires (nom d'utilisateur et email)

  if (!blog) {
    throw new Error("Blog non trouvé");
  }
  return blog;
};


//Fonction pour Obtenir tous les blogs
const getBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find()
      .populate("author", "username")        // pour afficher le nom de l'auteur
      .populate("categorie", "nom");        // nom de la catégorie

    res.json({
      blogs,
      currentPage: 1,
      totalPages: 1,
      totalBlogs: blogs.length,
      hasPrevious: false,
      hasNext: false
    });
  } catch (err) {
    next(err);
  }
};

// Fonction pour Obtenir un blog par ID
const getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("author", "username")
      .populate("categorie", "nom");
    if (!blog) return res.status(404).json({ message: "Blog introuvable" });

    res.status(200).json({
      blog,
      message: "Blog récupéré avec succès"
    });
  } catch (err) {
    next(err);
  }
};


//Fonction pout créer un blog 
const createBlog = async (req, res) => {
  try {
    // 1. Récupération des données
    const { title, content, tags } = req.body;

    // 2. Gestion de la catégorie (avec compatibilité ascendante)
    let categorie = req.body.categorie || req.body.category;

    // 3. Validation que la catégorie est bien fournie
    if (!categorie) {
      return res.status(400).json({
        success: false,
        message: "Le champ 'categorie' est requis"
      });
    }

    // Conversion de la catégorie en ObjectId si ce n'est pas déjà fait
    if (typeof categorie === 'string' && mongoose.isValidObjectId(categorie)) {
      categorie = new mongoose.Types.ObjectId(categorie);
    } else if (!(categorie instanceof mongoose.Types.ObjectId)) {
      return res.status(400).json({
        success: false,
        message: "Format d'ID de catégorie invalide"
      });
    }

    //Vérification que la catégorie existe
    const categoryExists = await mongoose.model('Categorie').findById(categorie);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Catégorie non trouvée"
      });
    }

    //. Validation avec Yup
    const validatedData = await blogValidationSchema.validate({
      title,
      content,
      categorie,
      tags,
      imageUrl: req.file ? `/uploads/blog-images/${req.file.filename}` : null
    }, { abortEarly: false });

    // Création du blog
    const newBlog = new Blog({
      title: validatedData.title,
      content: validatedData.content,
      categorie: validatedData.categorie,
      tags: Array.isArray(validatedData.tags)
        ? validatedData.tags
        : validatedData.tags.split(',').map(t => t.trim()).filter(t => t),
      author: validatedData.author,             //req.user._id, // Utilisez l'ID de l'utilisateur connecté
      imageUrl: validatedData.imageUrl
    });

    //Sauvegarde
    const savedBlog = await newBlog.save();

    //9. Réponse
    res.status(201).json({
      success: true,
      data: savedBlog,
      message: "Blog créé avec succès"
    });

  } catch (error) {
    console.error("Erreur création blog:", error);

    // Gestion des erreurs Yup
    if (error instanceof yup.ValidationError) {
      return res.status(400).json({
        success: false,
        errors: error.errors,
        type: "validation_error"
      });
    }

    // Gestion des erreurs MongoDB
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Format d'ID invalide"
      });
    }

    // Erreur serveur générique
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la création du blog",
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

//Fonction pour mettre à jour un blog
const updateBlog = async (req, res, next) => {
  try {
    const { title, content, tags, categorie } = req.body;

    // Vérification des champs obligatoires
    if (!title || !content || !categorie) {
      return res.status(400).json({
        message: "Le titre, le contenu et la catégorie sont obligatoires."
      });
    }

    if (tags && !Array.isArray(tags)) {
      return res.status(400).json({
        message: "Le champ 'tags' doit être un tableau de chaînes de caractères."
      });
    }

    const updatedFields = {
      title,
      content,
      categorie
    };

    if (tags) {
      updatedFields.tags = tags;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }             //new: true signifie qu’on retourne le blog après modif et pas l'ancien
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog non trouvé." });
    }

    res.status(200).json(updatedBlog);
  } catch (err) {
    console.error("Erreur lors de la mise à jour du blog :", err);
    next(err);
  }
};


//Fonction pour supprimer un blog
const deleteBlog = async (req, res, next) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog) {
      return res.status(404).json({ message: "Blog non trouvé" });
    }

    res.json({ message: "Blog supprimé avec succès !" });
  } catch (err) {
    next(err);
  }
};


//Fonction pour ajouter un commentaire
const addComment = async (req, res, next) => {
  try {
    const { blogId } = req.params;
    const { content } = req.body;

    // if (!req.user) {
    //   return res.status(401).json({ message: 'Vous devez être connecté pour commenter' });
    // }

    const blog = await findBlogById(blogId);

    const newComment = {
      author: "67f7c565f989b5df2b2892ed",
      content
    };

    blog.comments.push(newComment);
    await blog.save();

    res.status(201).json({ message: 'Commentaire ajouté avec succès', blog });
  } catch (err) {
    next(err);
  }
};

// Fonction pour modifier un commentaire
const updateComment = async (req, res, next) => {
  try {
    const { blogId, commentId } = req.params;
    const { content } = req.body;

    //// Cherche le blog par son ID dans la base de données
    const blog = await findBlogById(blogId);
    const comment = blog.comments.find(
      (comment) => comment._id.toString() === commentId
    );

    if (!comment) {
      return res.status(404).json({ message: "Commentaire non trouvé" });
    }

    // Modifie le contenu du commentaire
    comment.content = content;

    // Sauvegarde le blog avec le commentaire mis à jour
    await blog.save();

    res.status(200).json({ message: "Commentaire modifié avec succès", blog });
  } catch (err) {
    next(err); // Passer l'erreur au middleware d'erreur
  }
};


// Fonction pour  Supprimer un commentaire
const deleteComment = async (req, res, next) => {
  try {
    const { blogId, commentId } = req.params;

    const blog = await findBlogById(blogId);
    const commentIndex = blog.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({ message: "Commentaire non trouvé" });
    }

    blog.comments.splice(commentIndex, 1);
    await blog.save();

    res.status(200).json({ message: "Commentaire supprimé avec succès", blog });
  } catch (err) {
    next(err);        //gestion des errerus 
  }
};


//Fonction pour pagination des blogs
const getBlogsPaginated = async (req, res, next) => {
  try {

    const page = parseInt(req.query.page) || 1;

    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;   //ignore

    const blogs = await Blog.find().skip(skip).limit(limit);
    const totalBlogs = await Blog.countDocuments();

    const totalPages = Math.ceil(totalBlogs / limit);

    res.json({
      blogs,
      currentPage: page,
      totalPages,
      totalBlogs,
      hasPrevious: page > 1,
      hasNext: page < totalPages
    });
  } catch (err) {
    next(err);
  }
};

// Fonction pour  Pagination des commentaires
const getCommentsPaginated = async (req, res, next) => {
  try {
    const blogId = req.params.blogId;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;


    const blog = await Blog.findById(blogId).select('comments');
    if (!blog) {
      return res.status(404).json({ message: 'Blog non trouvé' });
    }

    const totalComments = blog.comments.length;
    const totalPages = Math.ceil(totalComments / limit);
    const comments = blog.comments.slice(skip, skip + limit);    //slice() découpe les commentaires à partir de skip et en prend limi

    return res.status(200).json({
      comments,
      totalComments,
      totalPages,
      currentPage: page,
    });
  } catch (err) {
    next(err);
  }
};

//Fonction pour ajouter un like à un blog (systéme de like)
const likeBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = "67f7c53df989b5df2b2892e8";

    const blog = await findBlogById(id);

    if (blog.likes.includes(userId)) {
      return res.status(400).json({ message: "Vous avez déjà aimé ce blog." });
    }

    //ajoute l'ID de l'utilisateur à la liste des likes du blog
    blog.likes.push(userId);

    //Incrémente le compteur de likes du blog
    blog.likeCount += 1;

    await blog.save();

    res.status(200).json({ message: "Blog aimé avec succès.", likeCount: blog.likeCount });
  } catch (err) {
    next(err);
  }
};


//Fonction recommandation de blogs similaires par tags (recherche insensible à la casse)
const getRecommendedBlogs = async (req, res) => {
  const blogId = req.params.id;

  try {
    const currentBlog = await Blog.findById(blogId);
    if (!currentBlog) {
      return res.status(404).json({ message: "Blog non trouvé" });
    }

    const tags = currentBlog.tags;       //réccupére tous les tags du blog actuel
    if (!tags || tags.length === 0) {
      return res.status(200).json([]);
    }

    // Créer des regex insensibles à la casse pour chaque tag
    const regexTags = tags.map(tag => new RegExp(`^${tag}$`, "i"));

    // Recherche des blogs ayant AU MOINS UN tag en commun, excluant le blog courant
    const recommendedBlogs = await Blog.find({
      _id: { $ne: blogId },
      tags: { $in: regexTags },
    })
      .limit(5)
      .populate("author", "name")
      .populate("categorie", "name");

    res.status(200).json(recommendedBlogs);
  } catch (error) {
    console.error("Erreur lors de la récupération des blogs recommandés :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


//Fonction pour les blogs les plus likés
const getPopularBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ likeCount: { $gt: 0 } }) // uniquement ceux qui ont des likes
      .sort({ likeCount: -1 }) // triés du plus liké au moins liké
      .limit(10); // les 10 plus populaires

    res.status(200).json(blogs);
  } catch (error) {
    console.error("Erreur lors de la récupération des blogs populaires :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


//Fonction pour ajouter un TAG à un BLOG 
const addTagsToBlog = async (req, res) => {
  const { id } = req.params;
  const { tags } = req.body;

  try {
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog non trouvé' });
    }

    // Ajouter les nouveaux tags (uniques)
    blog.tags = [...new Set([...blog.tags, ...tags])];

    await blog.save();
    res.status(200).json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  addComment,
  updateComment,
  deleteComment,
  getBlogsPaginated,
  getCommentsPaginated,
  likeBlog,
  getRecommendedBlogs,
  getPopularBlogs,
  addTagsToBlog

};
*/
const mongoose = require('mongoose');
const { Blog, blogValidationSchema } = require('../models/Blog');
const User = require('../../server/models/Usermodel');
const yup = require("yup");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Helper: find blog by ID
const findBlogById = async (blogId) => {
  if (!mongoose.Types.ObjectId.isValid(blogId)) {
    throw new Error("ID de blog invalide");
  }

  const blog = await Blog.findById(blogId)
    .populate("author", "username email")
    .populate("comments.author", "username email");

  if (!blog) throw new Error("Blog non trouvé");
  return blog;
};

// Get all blogs
const getBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find()
      .populate("author", "username")
      .populate("categorie", "nom");

    res.json({
      blogs,
      currentPage: 1,
      totalPages: 1,
      totalBlogs: blogs.length,
      hasPrevious: false,
      hasNext: false
    });
  } catch (err) {
    next(err);
  }
};

// Get blog by ID
const getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("author", "username")
      .populate("categorie", "nom");

    if (!blog) return res.status(404).json({ message: "Blog introuvable" });

    res.status(200).json({ blog, message: "Blog récupéré avec succès" });
  } catch (err) {
    next(err);
  }
};

// Create a blog
const createBlog = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    let categorie = req.body.categorie || req.body.category;

    if (!categorie) {
      return res.status(400).json({ success: false, message: "Le champ 'categorie' est requis" });
    }

    if (typeof categorie === 'string' && mongoose.isValidObjectId(categorie)) {
      categorie = new mongoose.Types.ObjectId(categorie);
    } else if (!(categorie instanceof mongoose.Types.ObjectId)) {
      return res.status(400).json({ success: false, message: "Format d'ID de catégorie invalide" });
    }

    const categoryExists = await mongoose.model('Categorie').findById(categorie);
    if (!categoryExists) {
      return res.status(404).json({ success: false, message: "Catégorie non trouvée" });
    }

    const validatedData = await blogValidationSchema.validate({
      title,
      content,
      categorie,
      tags,
      imageUrl: req.file ? `/uploads/blog-images/${req.file.filename}` : null
    }, { abortEarly: false });

    const newBlog = new Blog({
      title: validatedData.title,
      content: validatedData.content,
      categorie: validatedData.categorie,
      tags: Array.isArray(validatedData.tags)
        ? validatedData.tags
        : validatedData.tags?.split(',').map(t => t.trim()).filter(t => t),
      author: req.user._id,
      imageUrl: validatedData.imageUrl
    });

    const savedBlog = await newBlog.save();

    res.status(201).json({ success: true, data: savedBlog, message: "Blog créé avec succès" });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return res.status(400).json({ success: false, errors: error.errors, type: "validation_error" });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: "Format d'ID invalide" });
    }

    res.status(500).json({ success: false, message: "Erreur serveur", detail: error.message });
  }
};

// Update blog
const updateBlog = async (req, res, next) => {
  try {
    const { title, content, tags, categorie } = req.body;

    if (!title || !content || !categorie) {
      return res.status(400).json({ message: "Le titre, le contenu et la catégorie sont obligatoires." });
    }

    if (tags && !Array.isArray(tags)) {
      return res.status(400).json({ message: "Le champ 'tags' doit être un tableau de chaînes." });
    }

    const updatedFields = { title, content, categorie };
    if (tags) updatedFields.tags = tags;

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );

    if (!updatedBlog) return res.status(404).json({ message: "Blog non trouvé." });

    res.status(200).json(updatedBlog);
  } catch (err) {
    next(err);
  }
};

// Delete blog
const deleteBlog = async (req, res, next) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog) return res.status(404).json({ message: "Blog non trouvé" });

    res.json({ message: "Blog supprimé avec succès !" });
  } catch (err) {
    next(err);
  }
};

// Add comment
const addComment = async (req, res, next) => {
  try {
    const { blogId } = req.params;
    const { content } = req.body;

    const blog = await findBlogById(blogId);

    const newComment = {
      author: req.user._id,
      content
    };

    blog.comments.push(newComment);
    await blog.save();

    res.status(201).json({ message: 'Commentaire ajouté avec succès', blog });
  } catch (err) {
    next(err);
  }
};

// Update comment
const updateComment = async (req, res, next) => {
  try {
    const { blogId, commentId } = req.params;
    const { content } = req.body;

    const blog = await findBlogById(blogId);
    const comment = blog.comments.find(c => c._id.toString() === commentId);

    if (!comment) return res.status(404).json({ message: "Commentaire non trouvé" });
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Non autorisé à modifier ce commentaire" });
    }

    comment.content = content;
    await blog.save();

    res.status(200).json({ message: "Commentaire modifié avec succès", blog });
  } catch (err) {
    next(err);
  }
};

// Delete comment
const deleteComment = async (req, res, next) => {
  try {
    const { blogId, commentId } = req.params;

    const blog = await findBlogById(blogId);
    const commentIndex = blog.comments.findIndex(c => c._id.toString() === commentId);

    if (commentIndex === -1) return res.status(404).json({ message: "Commentaire non trouvé" });
    if (blog.comments[commentIndex].author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Non autorisé à supprimer ce commentaire" });
    }

    blog.comments.splice(commentIndex, 1);
    await blog.save();

    res.status(200).json({ message: "Commentaire supprimé avec succès", blog });
  } catch (err) {
    next(err);
  }
};

// Pagination - blogs
const getBlogsPaginated = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find().skip(skip).limit(limit);
    const totalBlogs = await Blog.countDocuments();
    const totalPages = Math.ceil(totalBlogs / limit);

    res.json({
      blogs,
      currentPage: page,
      totalPages,
      totalBlogs,
      hasPrevious: page > 1,
      hasNext: page < totalPages
    });
  } catch (err) {
    next(err);
  }
};

// Pagination - comments
const getCommentsPaginated = async (req, res, next) => {
  try {
    const blogId = req.params.blogId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blog = await Blog.findById(blogId).select('comments');
    if (!blog) return res.status(404).json({ message: 'Blog non trouvé' });

    const totalComments = blog.comments.length;
    const totalPages = Math.ceil(totalComments / limit);
    const comments = blog.comments.slice(skip, skip + limit);

    return res.status(200).json({
      comments,
      totalComments,
      totalPages,
      currentPage: page,
    });
  } catch (err) {
    next(err);
  }
};

// Like blog
const likeBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const blog = await findBlogById(id);

    if (blog.likes.includes(userId)) {
      return res.status(400).json({ message: "Vous avez déjà aimé ce blog." });
    }

    blog.likes.push(userId);
    blog.likeCount += 1;
    await blog.save();

    res.status(200).json({ message: "Blog aimé avec succès.", likeCount: blog.likeCount });
  } catch (err) {
    next(err);
  }
};

// Recommended blogs
const getRecommendedBlogs = async (req, res) => {
  const blogId = req.params.id;

  try {
    const currentBlog = await Blog.findById(blogId);
    if (!currentBlog) return res.status(404).json({ message: "Blog non trouvé" });

    const tags = currentBlog.tags;
    if (!tags || tags.length === 0) return res.status(200).json([]);

    const regexTags = tags.map(tag => new RegExp(`^${tag}$`, "i"));

    const recommendedBlogs = await Blog.find({
      _id: { $ne: blogId },
      tags: { $in: regexTags },
    })
      .limit(5)
      .populate("author", "name")
      .populate("categorie", "name");

    res.status(200).json(recommendedBlogs);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Popular blogs
const getPopularBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ likeCount: { $gt: 0 } })
      .sort({ likeCount: -1 })
      .limit(10);

    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Add tags
const addTagsToBlog = async (req, res) => {
  const { id } = req.params;
  const { tags } = req.body;

  try {
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: 'Blog non trouvé' });

    blog.tags = [...new Set([...blog.tags, ...tags])];
    await blog.save();

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  addComment,
  updateComment,
  deleteComment,
  getBlogsPaginated,
  getCommentsPaginated,
  likeBlog,
  getRecommendedBlogs,
  getPopularBlogs,
  addTagsToBlog
};
