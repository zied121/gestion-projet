const mongoose = require('mongoose');
const authMiddleware = require('../middlewares/authMiddleware');
const Blog = require("../models/Blog");



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
exports.addComment = async (req, res) => {
  try {
    const { blogId } = req.params;  // Récupérer l'ID du blog depuis les paramètres
    const { content } = req.body;  // Récupérer le contenu du commentaire depuis le corps de la requête

    // Vérifier que l'utilisateur est authentifié (avec le middleware authMiddleware)
    if (!req.user) {
      return res.status(401).json({ message: 'Vous devez être connecté pour commenter' });
    }

                  // Trouver le blog à modifier
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

               // Sauvegarder les modifications dans la base de données
    await blog.save();

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

