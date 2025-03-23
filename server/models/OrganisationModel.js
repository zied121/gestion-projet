const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const OrganisationSchema = new Schema({
   
    nom: {
        type: String,
        required: true
    },
    matricule_fiscal: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: false
    },
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: true
    },
    membres: [{
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur'
    }],
    projets: [{
        type: Schema.Types.ObjectId,
        ref: 'Projet'
    }]
});



module.exports = mongoose.model('Organisation', OrganisationSchema);