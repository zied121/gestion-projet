const mongoose = require('mongoose');

const functionalitySchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "advanced_reporting"
  description: { type: String, required: false },
  plans: [{ 
    type: String, 
    enum: ['standard', 'premium', 'premium_plus'], 
    required: true 
  }]
}, { timestamps: true });

module.exports = mongoose.model('Functionality', functionalitySchema);
