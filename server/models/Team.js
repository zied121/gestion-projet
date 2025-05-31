const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const yup = require('yup');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    code_hex: {
        type: String,
        required: true
    },
      Organisation_id: {
         type: Schema.Types.ObjectId,
        ref: 'Organisation',
        required: false
    }
}, { timestamps: true });

const Team = mongoose.model('Team', teamSchema);

const teamYupSchema = yup.object().shape({
    name: yup.string().required(),
    code_hex: yup.string().matches(/^#([0-9A-F]{3}){1,2}$/i, 'Must be a valid hex code').required()
});

module.exports = {
    Team,
    teamYupSchema
};
