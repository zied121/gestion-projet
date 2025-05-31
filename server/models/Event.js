// models/Event.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Évenement', 'Réunion', 'Tâche', 'Deadline', 'Holiday'],
        required: true
    },
    titre: {
        type: String,
        /*required: true*/
    },
    description: {
        type: String
    },
    fichier: {
        type: String,
        default: null
    },
    date_debut: {
        type: Date,
        required: true
    },
    date_fin: {
        type: Date,
        required: true
    },
    emplacement: {
        type: String,
        default: 'En ligne'
    },
    lien: {
        type: String,
        default: null
    },
    organisateur_id: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: function () {
            return this.type !== 'Holiday';
        }
    },
    projet_id: {
        type: Schema.Types.ObjectId,
        ref: 'Project'
    },
    // Champs pour la récurrence
    isRecurring: {
        type: Boolean,
        default: false
    },
    type_recurrence: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly', 'personnalise', 'none'],
        default: 'none'
    },
    custom_recurrence_days: {
        type: Number,
        default: null
    },
    recurrence_end_date: {
        type: Date,
        default: null
    },
    recurrence_count: {
        type: Number,
        default: null
    },
    // Référence à l'événement parent pour les instances récurrentes
    parent_event_id: {
        type: Schema.Types.ObjectId,
        ref: 'Event',
        default: null
    },
    // Numéro de l'instance dans la série récurrente
    recurrence_instance: {
        type: Number,
        default: 0
    },
    rappel: {
        type: [{
            time: Number,
            unit: {
                type: String,
                enum: ['minutes', 'hours', 'days']
            },
            sent: {
                type: Boolean,
                default: false
            }
        }],
        default: []
    },
    status: {
        type: String,
        enum: ['En_attente', 'Confirme', 'Annule', 'Terminé'],
        default: 'En_attente'
    },
        file: {
            type: String,
            default: 'none'
        },
    participants: [{
        participant_id: {
            type: Schema.Types.ObjectId,
            ref: 'Utilisateur'
        },
        accept: {
            type: Boolean,
            default: false
        },
        refuse: {
            type: Boolean,
            default: false
        },
        message: {
            type: String,
            default: ''
        }
    }]
}, {
    timestamps: true
});

// Index pour optimiser les requêtes sur les événements récurrents
eventSchema.index({ parent_event_id: 1 });
eventSchema.index({ date_debut: 1, date_fin: 1 });

module.exports = mongoose.model('Event', eventSchema);