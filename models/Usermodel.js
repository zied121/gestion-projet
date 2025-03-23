const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    motDePasse: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Admin_Application', 'Admin_Organisation', 'Manager', 'Membre'],
        default: 'Membre'
    },
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Utilisateur', userSchema);
