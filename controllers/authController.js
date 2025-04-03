const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

//Fonction pour enregistrer un nouvel utilisateur
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    //Vérification si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "L'email est déjà utilisé" });
    }

    //Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    //Création de l'utilisateur
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Sauvegarde de l'utilisateur dans la base de données
    await newUser.save();

    res.status(201).json({ message: "Utilisateur créé avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors de la création de l'utilisateur" });
  }
};

//Fonction pour connecter un utilisateur et générer un token
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérification si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérification du mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    // Création du token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Réponse avec le token
    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors de la connexion" });
  }
};
