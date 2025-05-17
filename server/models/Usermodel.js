const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const yup = require('yup');
const userSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    prenom: {
        type: String,
        required: false
    },
    dateDeNaissance: {
        type: Date,
        required: false
    },
    image: {
        type: String,
        required: false
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
    },
    Status:{
        type:String,
        required:false,
        default:'inactive'
    },
    otpCode: {
        type: String,
        required: false
    },
    otpExpires: {
        type: Date,
        required: false
    }
}, {
    timestamps: true 
});


const userYupSchema = yup.object().shape({
    nom: yup.string().required(),
    prenom: yup.string(),
    dateDeNaissance: yup.date(),
    image: yup.string(),
    email: yup.string().email().required(),
    motDePasse: yup.string().required(),
    Organisation_id: yup.string(),
    role: yup.string(),
    Status: yup.string().default('inactive'),
    otpCode: yup.string(),
    otpExpires: yup.date()
});
const User = mongoose.model('Utilisateur', userSchema);

module.exports = {
    User,
    userYupSchema
};