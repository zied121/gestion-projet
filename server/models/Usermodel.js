const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    Organisation_id: {
         type: Schema.Types.ObjectId,
        ref: 'Organisation',
        required: false
    },
    role:{
        type:String,
        required:false
    }
}, {
    timestamps: true 
});

module.exports = mongoose.model('Utilisateur', userSchema);
