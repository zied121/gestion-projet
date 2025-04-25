const express = require('express');
const router = express.Router();
const CategorieController = require('../Controllers/CategorieController');  


// Route POST pour ajouter une catégorie
router.post('/', CategorieController.addCategorie);

// Route pour récupérer toutes les catégories
router.get('/', CategorieController.getCategories);

// Route pour récupérer les blogs d'une catégorie spécifique
router.get("/categorie/:id", CategorieController.getBlogsByCategory);

module.exports = router;
