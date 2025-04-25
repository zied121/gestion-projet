const Categorie = require('../models/Categorie');
const { Blog, blogValidationSchema } = require("../models/Blog");


// ROUTE pour récupérer toutes les catégories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Categorie.find();  
    res.json(categories);  
  } catch (err) {
    res.status(500).json({ message: err.message });  
  }
};
    
// ROUTE pour récupérer les blogs par catégorie
exports.getBlogsByCategory = async (req, res) => {
  try {
    const blogs = await Blog.find({ categorie: req.params.id })  // Recherche les blogs par catégorie
      .populate('author')  
      .populate('categorie');  

    res.status(200).json(blogs);  
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des blogs par catégorie" });
  }
};

// ROUTE pour ajouter une nouvelle catégorie
exports.addCategorie = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    // Vérifie si une catégorie avec le même nom existe déjà
    const existingCategorie = await Categorie.findOne({ name });
    if (existingCategorie) {
      return res.status(400).json({ message: "Cette catégorie existe déjà." });
    }

    const newCategorie = new Categorie({ name, description, image });
    await newCategorie.save();

    res.status(201).json(newCategorie);  // Envoie la nouvelle catégorie en réponse
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de l'ajout de la catégorie", error: err.message });
  }
};
