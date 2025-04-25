const express = require('express');
const connectDb = require('./config/ConnectDb');
const cors = require('cors');
require("dotenv").config({
    path: "./config/.env"
});

const app = express();

// Importation des routes
const userRouter = require('./Routes/UserRoutes');
const AuthRoutes = require('./Routes/AuthRoutes');
const OrganisationRoutes = require('./Routes/OrganisationRoutes');
const feedbackRoutes = require('./Routes/feedbackRoutes');
const blogRoutes = require('./Routes/blogRoutes');
const categorieRoutes = require('./Routes/categorieRoutes');

// Middleware
app.use(express.json());  
app.use(cors());  

// Connexion à la base de données
connectDb();


// Routes
app.use('/api/organisation', OrganisationRoutes);
app.use('/api', AuthRoutes);
app.use('/api/users', userRouter);
app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/blogs", blogRoutes);
app.use('/api/categories', categorieRoutes);


// Démarrer le serveur
const port = process.env.PORT || 5000;  // Assure-toi que la variable d'environnement PORT est définie
app.listen(port, (error) => {
    if (error) {
        console.log('Le serveur a échoué à démarrer');
    } else {
        console.log('Le serveur fonctionne sur le port ' + port);
    }
});
