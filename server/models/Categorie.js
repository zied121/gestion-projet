const mongoose = require("mongoose");

const CategorieSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true 
  },
  description: {
    type: String,
    required: false
  },
  image: {
    type: String, 
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Categorie", CategorieSchema);

