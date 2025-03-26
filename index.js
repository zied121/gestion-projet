require('dotenv').config({ path: './config/.env' });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require('http');

// Importation des routes
const blogRoutes = require("./routes/blogRoutes");
const authRoutes = require("./routes/authRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

const app = express();
const server = http.createServer(app); // Créer un serveur HTTP avec Express

// Middleware
app.use(express.json()); //requête JSON
app.use(cors()); // Active CORS pour éviter les problèmes de communication

// Routes principales
app.use("/api/blogs", blogRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/feedbacks", feedbackRoutes);

// Connexion MongoDB
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Vérification de la présence de MONGO_URI
if (!MONGO_URI) {
    console.error("❌ ERREUR: La variable d'environnement MONGO_URI est manquante.");
    process.exit(1); // Quitte le processus si MONGO_URI est manquant
}

// Connexion à MongoDB
const connectToMongoDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true });
        console.log("✅ Connecté à MongoDB avec succès !");
        // Démarre le serveur une fois la connexion établie
        server.listen(PORT, () => console.log(`🚀 Serveur opérationnel sur http://localhost:${PORT}`));
    } catch (err) {
        console.error("❌ Erreur de connexion à MongoDB :", err);
        process.exit(1); // Quitte le processus en cas d'erreur critique
    }
};

// Lancer la connexion MongoDB
connectToMongoDB();
