const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const yup = require('yup');

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

 const OrganisationYupSchema = yup.object().shape({
    nom: yup.string().required(),
    matricule_fiscal: yup.string().required(),
    type: yup.string(),
    image: yup.string(),
    description: yup.string(),
    location: yup.string(),
    admin: yup.string(),
    membres: yup.array().of(yup.string()),
    projets: yup.array().of(yup.string()),
    subscription: yup.string()
 });


 
const  Organisation =  mongoose.model('Organisation', OrganisationSchema);

module.exports = {
    Organisation,
    OrganisationYupSchema
};
