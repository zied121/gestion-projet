const mongoose = require('mongoose');
const yup = require('yup');

const RoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur',
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur'
    }],
    projectID: {
        type: String,
        required: true,
        match: /^[0-9a-fA-F]{24}$/
    }
}, {
    timestamps: true
});

// ✅ Modèle Mongoose
const Room = mongoose.model('Room', RoomSchema);

// ✅ Schéma de validation (facultatif si tu veux valider côté API)
const ValideRoomSchema = yup.object({
    name: yup.string().required("Le nom est obligatoire").min(3, "Au moins 3 caractères"),
    projectID: yup.string().required("projectID requis").matches(/^[0-9a-fA-F]{24}$/, "projectID invalide"),
    members: yup.array().of(
        yup.string().matches(/^[0-9a-fA-F]{24}$/, "Membre invalide")
    ),
});

module.exports = Room; // ✅ Pour pouvoir faire const Room = require('...')
module.exports.ValideRoomSchema = ValideRoomSchema; // si tu veux valider
