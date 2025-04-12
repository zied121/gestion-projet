
        const Participant = require('../models/Participant');
        const Event = require('../models/Event');
        const Utilisateur = require('../models/Usermodel');
        const emailService = require('../config/emailservice');



        const addParticipants = async (req, res) => {
            try {
                const { participants } = req.body;
                const event_id = req.params.event_id.trim();

                // Vérifier si l'événement existe
                const event = await Event.findById(event_id);
                if (!event) {
                    return res.status(404).json({
                        success: false,
                        message: 'Événement non trouvé.'
                    });
                }

                // Vérifier si l'utilisateur est l'organisateur
                if (event.organisateur_id.toString() !== req.user._id.toString()) {
                    return res.status(403).json({
                        success: false,
                        message: 'Vous n\'êtes pas l\'organisateur de cet événement.'
                    });
                }

                // Vérifier si l'événement est de type "Réunion" ou "Événement"
                if (!['Réunion', 'Évenement'].includes(event.type)) {
                    return res.status(400).json({
                        success: false,
                        message: 'L\'ajout de participants est uniquement autorisé pour les événements de type "Réunion" ou "Événement".'
                    });
                }

                // Vérifier si les participants existent
                const existingUsers = await Utilisateur.find({
                    _id: { $in: participants }
                });

                if (existingUsers.length !== participants.length) {
                    return res.status(400).json({
                        success: false,
                        message: 'Certains participants n\'existent pas.'
                    });
                }

                // Vérifier si certains participants sont déjà ajoutés
                const existingParticipants = await Participant.find({
                    event_id: event_id,
                    id_participant: { $in: participants }
                });

                if (existingParticipants.length > 0) {
                    const existingIds = existingParticipants.map(p => p.id_participant.toString());
                    const newParticipants = participants.filter(id => !existingIds.includes(id.toString()));
                    
                    if (newParticipants.length === 0) {
                        return res.status(400).json({
                            success: false,
                            message: 'Tous ces participants sont déjà ajoutés à l\'événement.'
                        });
                    }

                    // Créer les entrées pour les nouveaux participants uniquement
                    const participantsData = newParticipants.map(participantId => ({
                        event_id: event_id,
                        id_participant: participantId,
                        organisateur_id: req.user._id,
                        reponse: 'en_attente'
                    }));

                    await Participant.insertMany(participantsData);

                    return res.status(201).json({
                        success: true,
                        message: 'Nouveaux participants ajoutés avec succès.',
                        ignored: existingIds.length
                    });
                }

                // Si aucun participant n'existe déjà, ajouter tous les nouveaux participants
                const participantsData = participants.map(participantId => ({
                    event_id: event_id,
                    id_participant: participantId,
                    organisateur_id: req.user._id,
                    reponse: 'en_attente'
                }));

                await Participant.insertMany(participantsData);

                res.status(201).json({
                    success: true,
                    message: 'Participants ajoutés avec succès.'
                });
            } catch (err) {
                res.status(400).json({ message: err.message });
            }
        };

    
const updateReponse = async (req, res) => {
    try {
        const { reponse, message } = req.body;
        const userId = req.user._id;
        const eventId = req.params.event_id;

        // Trouver l'événement
        const event = await Event.findById(eventId).populate('organisateur_id');
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Événement non trouvé.'
            });
        }

        // Trouver l'organisateur
        const organisateur = await Utilisateur.findById(event.organisateur_id);
        if (!organisateur || !organisateur.email) {
            return res.status(400).json({
                success: false,
                message: 'Information de l\'organisateur non trouvée.'
            });
        }

        // Trouver le participant
        const participantUser = await Utilisateur.findById(userId);
        if (!participantUser) {
            return res.status(404).json({
                success: false,
                message: 'Participant non trouvé.'
            });
        }

        // Vérifier que la réponse soit valide
        if (!['accepter', 'refuser'].includes(reponse)) {
            return res.status(400).json({
                success: false,
                message: 'La réponse doit être "accepter" ou "refuser".'
            });
        }

        // Trouver le participant à cet événement
        const participant = await Participant.findOne({ event_id: eventId, id_participant: userId });
        if (!participant) {
            return res.status(404).json({
                success: false,
                message: 'Vous n\'êtes pas inscrit à cet événement.'
            });
        }

        // Vérifier le type d'événement
        if (['Deadline', 'Holiday'].includes(event.type)) {
            return res.status(400).json({
                success: false,
                message: 'Les événements de type "Deadline" ou "Holiday" ne permettent pas de mettre à jour la réponse.'
            });
        }

        // Mettre à jour la réponse et le message
        participant.reponse = reponse;
        participant.message = message || '';
        await participant.save();

        // Envoyer l'email de notification
        try {
            const emailContent = emailService.getParticipantResponseEmail(
                event,
                {
                    nom: participantUser.nom || participantUser.email,
                    reponse,
                    message: message || ''
                },
                organisateur.email
            );
            
            await emailService.sendEmail(organisateur.email, emailContent);
            console.log(`✅ Notification envoyée à l'organisateur (${organisateur.email})`);
        } catch (emailError) {
            console.error('Erreur lors de l\'envoi de l\'email:', emailError);
            // On continue malgré l'erreur d'envoi d'email
        }

        res.status(200).json({
            success: true,
            message: 'Votre réponse a été enregistrée avec succès.',
            data: participant
        });

    } catch (err) {
        console.error('Erreur:', err);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la mise à jour de la réponse.',
            error: err.message
        });
    }
};

module.exports = {
    addParticipants,
    updateReponse
};