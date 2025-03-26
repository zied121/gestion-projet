const mongoose = require('mongoose');
const authMiddleware = require('../middlewares/authMiddleware');
const Blog = require("../models/Blog");
const User = require('../models/User');


//Fonction pour récupérer tous les blogs
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate("author", "username");
    res.json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des blogs" });
  }
};

//Fonction pour récupérer un blog par ID
exports.getBlogById = async (req, res) => {
  try {
    // Convertir l'ID de la requête en ObjectId valide (avec 'new')
    const blogId = new mongoose.Types.ObjectId(req.params.id);
    const blog = await Blog.findById(blogId).populate("author", "username");

    if (!blog) {
      return res.status(404).json({ message: "Blog non trouvé" });
    }

    res.json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors de la récupération du blog" });
  }
};

//Fonction pour créer un nouveau blog
exports.createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;

    // Vérification de la validité des données reçues
    if (!title || !content) {
      return res.status(400).json({ message: "Le titre et le contenu sont obligatoires" });
    }

    const newBlog = new Blog({
      title,
      content,
      author: req.user.id, //Récupération de l'ID de l'auteur depuis le token
    });

    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors de la création du blog" });
  }
};

//Fonction pour modifier un blog
exports.updateBlog = async (req, res) => {
  try {
    const { title, content } = req.body;

    // Vérification de la validité des données
    if (!title || !content) {
      return res.status(400).json({ message: "Le titre et le contenu sont obligatoires" });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true } // Retourne le blog mis à jour
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog non trouvé" });
    }

    res.json(updatedBlog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour du blog" });
  }
};

//Fonction pour supprimer un blog
exports.deleteBlog = async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);

    if (!deletedBlog) {
      return res.status(404).json({ message: "Blog non trouvé" });
    }

    res.json({ message: "Blog supprimé avec succès !" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors de la suppression du blog" });
  }
};


// Ajouter un commentaire à un blog
// Fonction pour ajouter un commentaire
exports.addComment = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { content } = req.body;

    // Vérification de l'authentification
    if (!req.user) {
      return res.status(401).json({ message: 'Vous devez être connecté pour commenter' });
    }

    // Trouver le blog
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog non trouvé' });
    }

    // Créer un nouveau commentaire
    const newComment = {
      author: req.user.id,  // L'ID de l'utilisateur qui fait le commentaire
      content: content,     // Le contenu du commentaire
    };

    // Ajouter le commentaire au tableau des commentaires du blog
    blog.comments.push(newComment);

    // Sauvegarder les modifications
    await blog.save();

    // Retourner la réponse
    res.status(201).json({ message: 'Commentaire ajouté avec succès', blog });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de l\'ajout du commentaire' });
  }
};


//route pour récupérer les commentaires d'un blog. 
exports.getComments = async (req, res) => {
  try {
    // Recherche du blog par son ID
    const blog = await Blog.findById(req.params.blogId);

    // Si le blog n'est pas trouvé
    if (!blog) {
      return res.status(404).json({ message: 'Blog non trouvé' });
    }

    // Retourne les commentaires du blog
    return res.status(200).json({ comments: blog.comments });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour un commentaire
exports.updateComment = async (req, res) => {
  try {
    const { blogId, commentId } = req.params;
    const { content } = req.body; // Le nouveau contenu du commentaire

    // Trouver le blog par son ID
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ message: "Blog non trouvé" });
    }

    // Trouver le commentaire à modifier
    const comment = blog.comments.find(
      (comment) => comment._id.toString() === commentId
    );

    if (!comment) {
      return res.status(404).json({ message: "Commentaire non trouvé" });
    }

    // Modifier le contenu du commentaire
    comment.content = content;

    await blog.save();

    res.status(200).json({
      message: "Commentaire modifié avec succès",
      blog,
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
};

// Supprimer un commentaire
exports.deleteComment = async (req, res) => {
  try {
    const { blogId, commentId } = req.params;

    // Trouver le blog par son ID
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ message: "Blog non trouvé" });
    }

    // Trouver le commentaire et le supprimer
    const commentIndex = blog.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({ message: "Commentaire non trouvé" });
    }

    // Supprimer le commentaire
    blog.comments.splice(commentIndex, 1);

    await blog.save();

    res.status(200).json({
      message: "Commentaire supprimé avec succès",
      blog,
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
};
// Récupérer les blogs avec pagination
exports.getBlogsPaginated = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find().skip(skip).limit(limit);
    const totalBlogs = await Blog.countDocuments();

    res.json({
      blogs,
      currentPage: page,
      totalPages: Math.ceil(totalBlogs / limit),
      totalBlogs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Fonction pour paginer les commentaires
exports.getCommentsPaginated = async (req, res) => {
  const blogId = req.params.blogId; // ID du blog pour lequel on veut récupérer les commentaires
  const page = parseInt(req.query.page) || 1; // Page courante
  const limit = parseInt(req.query.limit) || 10; // Nombre de commentaires par page
  const skip = (page - 1) * limit; // Calcul du décalage

  try {
    // Recherche du blog avec ses commentaires
    const blog = await Blog.findById(blogId).select('comments'); // On récupère seulement les commentaires
    if (!blog) {
      return res.status(404).json({ message: 'Blog non trouvé' });
    }

    // Paginer les commentaires directement en base de données
    const totalComments = blog.comments.length; // Nombre total de commentaires
    const totalPages = Math.ceil(totalComments / limit); // Calcul du nombre total de pages

    // On extrait seulement les commentaires nécessaires pour la page courante
    const comments = blog.comments.slice(skip, skip + limit);

    return res.status(200).json({
      comments,
      totalComments,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération des commentaires' });
  }
};



//route pour ajouter un like à un blog
exports.likeBlog = async (req, res) => {
  try {
    const { blogId } = req.params; // Récupération de l'ID du blog depuis l'URL
    const userId = req.user.id; // ID de l'utilisateur connecté (extrait du token)

    // Vérifier si le blog existe
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog non trouvé" });
    }

    // Vérifier si l'utilisateur a déjà aimé ce blog
    if (blog.likes.includes(userId)) {
      return res.status(400).json({ message: "Vous avez déjà aimé ce blog." });
    }

    // Ajouter l'utilisateur à la liste des likes
    blog.likes.push(userId);
    blog.likeCount += 1; // Augmenter le nombre de likes

    // Sauvegarder les modifications
    await blog.save();

    res.status(200).json({ message: "Blog aimé avec succès.", likeCount: blog.likeCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors du like du blog." });
  }
};