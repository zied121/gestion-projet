const mongoose = require('mongoose');
const Blog = require("../models/Blog");
const User = require('../models/User');

// Fonction utilitaire pour trouver un blog par ID
const findBlogById = async (blogId) => {
  if (!mongoose.Types.ObjectId.isValid(blogId)) {
    throw new Error("ID de blog invalide");
  }
  const blog = await Blog.findById(blogId)
    .populate("author", "username email")
    .populate("comments.author", "username email");
  
  if (!blog) {
    throw new Error("Blog non trouvé");
  }
  return blog;
};

// Obtenir tous les blogs
const getBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find().populate("author", "username");
    res.json(blogs);
  } catch (err) {
    next(err); // Passer l'erreur au middleware d'erreur
  }
};

// Obtenir un blog par ID
const getBlogById = async (req, res, next) => {
  try {
    const blog = await findBlogById(req.params.id);
    res.status(200).json({
      blog,
      message: "Blog récupéré avec succès"
    });
  } catch (err) {
    next(err); // Passer l'erreur au middleware d'erreur
  }
};

// Créer un blog
const createBlog = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Le titre et le contenu sont obligatoires" });
    }

    const newBlog = new Blog({
      title,
      content,
      author: req.user.id,
    });

    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (err) {
    next(err); // Passer l'erreur au middleware d'erreur
  }
};

// Mettre à jour un blog
const updateBlog = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Le titre et le contenu sont obligatoires" });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog non trouvé" });
    }

    res.json(updatedBlog);
  } catch (err) {
    next(err); // Passer l'erreur au middleware d'erreur
  }
};

// Supprimer un blog
const deleteBlog = async (req, res, next) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog) {
      return res.status(404).json({ message: "Blog non trouvé" });
    }

    res.json({ message: "Blog supprimé avec succès !" });
  } catch (err) {
    next(err); // Passer l'erreur au middleware d'erreur
  }
};

// Ajouter un commentaire
const addComment = async (req, res, next) => {
  try {
    const { blogId } = req.params;
    const { content } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: 'Vous devez être connecté pour commenter' });
    }

    const blog = await findBlogById(blogId);

    const newComment = {
      author: req.user.id,
      content
    };

    blog.comments.push(newComment);
    await blog.save();

    res.status(201).json({ message: 'Commentaire ajouté avec succès', blog });
  } catch (err) {
    next(err); // Passer l'erreur au middleware d'erreur
  }
};

// Modifier un commentaire
const updateComment = async (req, res, next) => {
  try {
    const { blogId, commentId } = req.params;
    const { content } = req.body;

    const blog = await findBlogById(blogId);
    const comment = blog.comments.find(
      (comment) => comment._id.toString() === commentId
    );

    if (!comment) {
      return res.status(404).json({ message: "Commentaire non trouvé" });
    }

    comment.content = content;
    await blog.save();

    res.status(200).json({ message: "Commentaire modifié avec succès", blog });
  } catch (err) {
    next(err); // Passer l'erreur au middleware d'erreur
  }
};

// Supprimer un commentaire
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
    next(err); // Passer l'erreur au middleware d'erreur
  }
};

// Pagination des blogs
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
    next(err); // Passer l'erreur au middleware d'erreur
  }
};

// Pagination des commentaires
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
    const comments = blog.comments.slice(skip, skip + limit);

    return res.status(200).json({
      comments,
      totalComments,
      totalPages,
      currentPage: page,
    });
  } catch (err) {
    next(err); // Passer l'erreur au middleware d'erreur
  }
};

// Ajouter un like à un blog
const likeBlog = async (req, res, next) => {
  try {
    const { blogId } = req.params;
    const userId = req.user.id;

    const blog = await findBlogById(blogId);

    if (blog.likes.includes(userId)) {
      return res.status(400).json({ message: "Vous avez déjà aimé ce blog." });
    }

    blog.likes.push(userId);
    blog.likeCount += 1;

    await blog.save();

    res.status(200).json({ message: "Blog aimé avec succès.", likeCount: blog.likeCount });
  } catch (err) {
    next(err); // Passer l'erreur au middleware d'erreur
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
  likeBlog
};
