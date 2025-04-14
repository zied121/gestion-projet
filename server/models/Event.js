    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;

    const eventSchema = new mongoose.Schema({
        type: {
            type: String,
            enum: ['Évenement', 'Réunion', 'Tâche','Deadline','Holiday'],
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
            default:'En ligne'
        },
        lien: { type: String,
             default: null }, 
        
    
        organisateur_id: {
            type: Schema.Types.ObjectId,
            ref: 'Utilisateur',
            required: function() {
                // Rendre l'organisateur_id obligatoire uniquement si le type n'est pas "Holiday"
                return this.type !== 'Holiday';
            }
        },
        projet_id: {  
            type: Schema.Types.ObjectId,
            ref: 'Project'
        },
        isRecurring: {
            type: Boolean,
            default: false
        },
        type_recurrence: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'none'],
            default: 'none'
        },
        status: {
            type: String,
            enum: ['En_attente', 'Confirme', 'Annule', 'Terminé'],
            default: 'En_attente'
        }, 
        file: {
            type: String,
            default: 'none'
        }
    }, {
        timestamps: true
    });

    module.exports = mongoose.model('Event', eventSchema);
