const mongoose = require("mongoose");
const yup = require("yup");

const RoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur',
    },
        projectID: {
            type: String,
            //required: true
        },

    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur'
    }],
        project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },

},



);

const ValideRoomSchema = yup.object({
  name: yup.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  image: yup.string().url("L'URL de l'image n'est pas valide").nullable(),
  projectID: yup.string().matches(/^[0-9a-fA-F]{24}$/, "projectID invalide"),
  members: yup.array().of(yup.string().matches(/^[0-9a-fA-F]{24}$/, "Membre invalide")),
});
const Room = mongoose.model("Rooms", RoomSchema);
module.exports = {Room, ValideRoomSchema};

