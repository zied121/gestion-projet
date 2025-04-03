const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");

const router = express.Router();

// Route pour enregistrer un nouvel utilisateur
router.post("/register", async (req, res, next) => {
  try {
    await registerUser(req, res);
  } catch (error) {
    next(error); // Passer l'erreur au gestionnaire d'erreurs global
  }
});

//Route pour connecter un utilisateur et récupérer un token
router.post("/login", async (req, res, next) => {
  try {
    await loginUser(req, res);
  } catch (error) {
    next(error); // Passer l'erreur au gestionnaire d'erreurs global
  }
});

module.exports = router;
