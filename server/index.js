const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require("dotenv").config({ path: "./config/.env" });

const connectDb = require('./config/ConnectDb');
const app = express();

// === Configuration des dossiers d'upload ===
const createUploadDirs = () => {
  const uploadsDir = path.join(__dirname, 'uploads');
  const blogImagesDir = path.join(uploadsDir, 'blog-images');
  
  [uploadsDir, blogImagesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Dossier créé : ${dir}`);
    }
  });
  
  return { uploadsDir, blogImagesDir };
};

const { uploadsDir, blogImagesDir } = createUploadDirs();

// === Configuration Multer globale ===
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, blogImagesDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées!'), false);
  }
};

app.multerUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(uploadsDir));

// Connexion à la base de données
connectDb();

// Importation des routes
const userRouter = require('./Routes/UserRoutes');
const AuthRoutes = require('./Routes/AuthRoutes');
const OrganisationRoutes = require('./Routes/OrganisationRoutes');
const feedbackRoutes = require('./Routes/feedbackRoutes');
const blogRoutes = require('./Routes/blogRoutes');
const categorieRoutes = require('./Routes/categorieRoutes');

// Déclaration des routes
app.use('/api/organisation', OrganisationRoutes);
app.use('/api', AuthRoutes);
app.use('/api/users', userRouter);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/categories', categorieRoutes);

// Middleware global de gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur:', err);

  const status = err.status || 500;
  const message = err.message || 'Erreur interne du serveur';

  res.status(status).json({
    error: true,
    message,
    ...(err.errors && { errors: err.errors })
  });
});

// Démarrer le serveur
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});