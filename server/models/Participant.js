const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const participantSchema = new mongoose.Schema({
  event_id: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  id_participant: {
    type: Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  organisateur_id: {
    type: Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  reponse: {
    type: String,
    enum: ['accepter', 'refuser', 'en_attente'],
    default: 'en_attente'
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('Participant', participantSchema);