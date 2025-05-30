const mongoose = require("mongoose");
const yup = require("yup");

// Schéma de validation avec Yup
const blogValidationSchema = yup.object({
  title: yup.string().required("Le titre est obligatoire"),
  content: yup.string().required("Le contenu est obligatoire"),
  categorie: yup
    .mixed()
    .test(
      "is-valid-objectid-or-string",
      "La catégorie doit être un ID valide ou un nom de catégorie",
      function (value) {
        return (
          mongoose.Types.ObjectId.isValid(value) ||
          (typeof value === "string" && value.trim().length > 0)
        );
      }
    )
    .required("La catégorie est obligatoire"),
  tags: yup
    .mixed()
    .test(
      "is-valid-tags",
      "Les tags doivent être une chaîne séparée par des virgules ou un tableau",
      (value) => {
        if (value === undefined || value === null) return true; // Optionnel
        if (Array.isArray(value)) return true;
        if (typeof value === "string") return true;
        return false;
      }
    )
    .transform((value) => {
      if (!value) return []; // Si vide, retourne un tableau vide
      if (Array.isArray(value)) return value;
      return value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    })
    .optional(),
  imageUrl: yup.string().nullable()
});



// Schéma pour un commentaire dans un blog
const CommentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Utilisateur",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

// Schéma Mongoose pour un blog
const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Utilisateur",
      required: true,
    },
    categorie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categorie",
      required: true,
      // Ajout d'un setter pour gérer les strings
      set: function (value) {
        // Si c'est déjà un ObjectId, le retourner tel quel
        if (mongoose.Types.ObjectId.isValid(value)) {
          return value;
        }
        // Sinon, essayer de trouver la catégorie par nom
        return mongoose.model("Categorie")
          .findOne({ name: value })
          .then((cat) => cat?._id || value);
      },
    },
    comments: [CommentSchema],
    createdAt: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Utilisateur" }],
    likeCount: { type: Number, default: 0 },
    tags: [{ type: String }],
    imageUrl: { type: String },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Export du modèle et du schéma de validation
module.exports = {
  Blog: mongoose.model("Blog", BlogSchema),
  blogValidationSchema,
};