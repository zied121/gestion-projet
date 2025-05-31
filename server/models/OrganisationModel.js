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
       
    },
    type: {
        type: String,
        required: false,
    },
    image: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    location: {
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
        ref: 'Utilisateur',
        required: false
    }],
    projets: [{
        type: Schema.Types.ObjectId,
        ref: 'Projet',
        required: false
    }],
    subscription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
        required: false
    }
});

module.exports = mongoose.model('Organisation', OrganisationSchema);
