const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {

  // Récupération du token depuis l'en-tête Authorization
  const token = req.header("Authorization")?.split(" ")[1];

  // Vérifier si le token est fourni
  if (!token) {
    return res.status(401).json({ message: "Accès refusé, aucun token fourni" });
  }

  try {
    // Vérifie le token et décode les informations utilisateur
   const verified = jwt.verify(token, process.env.JWT_SECRET); // Utilisation de la clé secrète depuis les variables d'environnement

    req.user = verified; // Ajoute les informations de l'utilisateur dans la requête

    next(); // Passe à la route suivante
  } catch (err) {

    // Si le token est invalide ou expiré
    return res.status(400).json({ message: "Token invalide ou expiré" });
  }
};

module.exports = authMiddleware;
