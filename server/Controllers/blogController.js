const mongoose = require('mongoose');
const Blog = require("../models/Blog");
const User = require('../models/User');



///// Fonction pour trouver un blog par ID
const findBlogById = async (blogId) => {

  //Vérification de la validité de l'ID du blog
  if (!mongoose.Types.ObjectId.isValid(blogId)) {
    throw new Error("ID de blog invalide");
  }

  // Recherche du blog dans la base de données par son ID
  const blog = await Blog.findById(blogId)
    .populate("author", "username email")               // Remplir les informations de l'auteur (nom d'utilisateur et email)
    .populate("comments.author", "username email");     // Remplir les informations de l'auteur des commentaires (nom d'utilisateur et email)


  // Si le blog n'est pas trouvé, lancer une erreur
  if (!blog) {
    throw new Error("Blog non trouvé");
  }
  return blog;
};


//// Obtenir tous les blogs
const getBlogs = async (req, res, next) => {
  try {

    // // Recherche tous les blogs dans la base de données
    const blogs = await Blog.find().populate("author", "username");
    res.json(blogs);
  } catch (err) {               //try catch 	Pour capturer et gérer les erreurs
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

///// Créer un blog
const createBlog = async (req, res, next) => {
  try {
    const { title, content } = req.body;          //req.body Contient les données envoyées ,:ex: content
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

//// Mettre à jour un blog
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


//// Supprimer un blog
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

////// Ajouter un commentaire
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

    //// Récupère la page actuelle à partir des paramètres de requête, avec une valeur par défaut de 1 si non spécifiée
    const page = parseInt(req.query.page) || 1;

    //// Récupère le nombre d'éléments à afficher par page, avec une valeur par défaut de 10 si non spécifiée
    const limit = parseInt(req.query.limit) || 10;


    //// Calcule combien de documents doivent être ignorés pour obtenir la page souhaitée
    // La première page (page = 1) commence à 0, la deuxième page commence à 'limit' documents
    const skip = (page - 1) * limit;

    const blogs = await Blog.find().skip(skip).limit(limit);
    const totalBlogs = await Blog.countDocuments();
    const totalPages = Math.ceil(totalBlogs / limit);

    res.json({
      blogs,
      currentPage: page,      // La page actuellement demandée
      totalPages,
      totalBlogs,
      hasPrevious: page > 1,      // Indicateur si la page actuelle est supérieure à 1 (il y a une page précédente)
      hasNext: page < totalPages        //// Indicateur si la page actuelle est inférieure au nombre total de pages (il y a une page suivante)
    });
  } catch (err) {
    next(err); // Passer l'erreur au middleware d'erreur
  }
};

// Pagination des commentaires
const getCommentsPaginated = async (req, res, next) => {
  try {
    const blogId = req.params.blogId;

    // Récupère le numéro de la page à partir des paramètres de requête, avec une valeur par défaut de 1 si non spécifiée
    const page = parseInt(req.query.page) || 1;

    //// Récupère le nombre d'éléments par page à partir des paramètres de requête, avec une valeur par défaut de 10 si non spécifiée
    const limit = parseInt(req.query.limit) || 10;

    //// Calcule combien de documents doivent être ignorés pour obtenir la page souhaitée
    const skip = (page - 1) * limit;


    // Cherche le blog par son ID et sélectionne uniquement le champ 'comments'
    const blog = await Blog.findById(blogId).select('comments');
    if (!blog) {
      return res.status(404).json({ message: 'Blog non trouvé' });
    }


    //// Récupère le nombre total de commentaires du blog
    const totalComments = blog.comments.length;

    // // Calcule le nombre total de pages en fonction du nombre total de commentaires et du nombre de commentaires par page
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

// Ajouter un like à un blogc(systéme de like)
const likeBlog = async (req, res, next) => {
  try {

    // Récupère l'ID du blog à partir des paramètres de la requête (URL)
    const { blogId } = req.params;

    //// Récupère l'ID de l'utilisateur authentifié à partir de l'objet `user` attaché à la requête
    const userId = req.user.id;

    // // Cherche le blog par son ID dans la base de données
    const blog = await findBlogById(blogId);


    // Si l'utilisateur a déjà aimé ce blog, renvoie une erreur avec un message spécifique
    if (blog.likes.includes(userId)) {
      return res.status(400).json({ message: "Vous avez déjà aimé ce blog." });
    }


    // // Ajoute l'ID de l'utilisateur à la liste des likes du blog
    blog.likes.push(userId);

    // Incrémente le compteur de likes du blog
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
