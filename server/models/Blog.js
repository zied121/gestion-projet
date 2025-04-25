const mongoose = require("mongoose");
const yup = require("yup");


// Schéma de validation avec Yup
const blogValidationSchema = yup.object({
  title: yup.string().required("Le titre est obligatoire"),
  content: yup.string().required("Le contenu est obligatoire"),
  categorie: yup.string().required("La catégorie est obligatoire"),
  tags: yup.array().of(yup.string()).optional()
});


//Schéma pour un commentaire dans un blog
const CommentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // USER qui écrit le commentaire

  content: {          //contenu du shéma
    type: String,
    required: true,
    minlength: 3,     // Minimum 3 caractères
    maxlength: 500    // Maximum 500 caractères
  },

  createdAt: { type: Date, default: Date.now }  // Date de création
});


// Schéma Mongoose pour un blog
const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  categorie: { type: mongoose.Schema.Types.ObjectId, ref: 'Categorie', required: true },
  comments: [], 
  createdAt: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likeCount: { type: Number, default: 0 },
  tags: [{ type: String }]
});



// Export du modèle et du schéma de validation
module.exports = {
  Blog: mongoose.model("Blog", BlogSchema),
  blogValidationSchema
};