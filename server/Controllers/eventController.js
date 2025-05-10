const Event = require('../models/Event');

const Holiday = require('../models/Holiday'); 
const Participant = require('../models/Participant');
const Utilisateur = require('../models/Usermodel'); 
const Project = require('../models/ProjectModel');
const emailService = require('../config/nodemailer');
const { scheduleEventReminders } = require('../services/reminderScheduler');
const validateEvent = require('../Middleware/eventValidation');

const syncHolidayEvents = async () => {
    try {
        //console.log('Début de la synchronisation des événements Holiday');
        
        // Récupération des données
        const [allUsers, holidays] = await Promise.all([
            Utilisateur.find({}, '_id'), // Seulement les IDs
            Holiday.find()
        ]);

        //console.log(`Utilisateurs trouvés: ${allUsers.length}, Holidays trouvés: ${holidays.length}`);
        
        const results = [];

        // 2. Pour chaque holiday
        for (const holiday of holidays) {
            try {
                //console.log(`\nTraitement de: ${holiday.titre}`);
                
                // Trouver ou créer l'événement
                let event = await Event.findOneAndUpdate(
                    {
                        type: 'Holiday',
                        date_debut: holiday.date,
                        titre: holiday.titre
                    },
                    {
                        $setOnInsert: { // Seulement pour les nouveaux
                            description: holiday.description,
                            date_fin: holiday.date,
                            organisateur_id: null,
                            status: 'Confirme'
                        }
                    },
                    {
                        upsert: true,
                        new: true,
                        setDefaultsOnInsert: true
                    }
                );

                //console.log(`Événement ${event._id} prêt`);

                // 3. Vérifier les participants existants
                const existingParticipantIds = (await Participant.find(
                    { event_id: event._id },
                    'id_participant -_id'
                )).map(p => p.id_participant.toString());

                //console.log(`${existingParticipantIds.length} participants existants`);

               // Identifier les utilisateurs manquants
                const missingUsers = allUsers.filter(user => 
                    !existingParticipantIds.includes(user._id.toString())
                );

                //console.log(`${missingUsers.length} utilisateurs à ajouter`);

                // 5. Ajouter les participants manquants
                if (missingUsers.length > 0) {
                    const toInsert = missingUsers.map(user => ({
                        event_id: event._id,
                        id_participant: user._id,
                        organisateur_id: null,
                        reponse: 'accepter'
                    }));

                    // Insertion en batch avec gestion d'erreurs
                    try {
                        const result = await Participant.insertMany(toInsert, { ordered: false });
                        //console.log(`${result.length} participants ajoutés`);
                    } catch (insertError) {
                        //console.error('Erreur insertion batch:', insertError.message);
                        // Fallback: insertion un par un
                        let successCount = 0;
                        for (const participant of toInsert) {
                            try {
                                await Participant.create(participant);
                                successCount++;
                            } catch (e) {
                                //console.error(`Échec participant ${participant.id_participant}:`, e.message);
                            }
                        }
                        //console.log(`${successCount} participants ajoutés (fallback)`);
                    }
                }

                results.push({
                    event: event._id,
                    title: event.titre,
                    existingParticipants: existingParticipantIds.length,
                    addedParticipants: missingUsers.length,
                    totalParticipants: existingParticipantIds.length + missingUsers.length
                });

            } catch (error) {
                //console.error(`Erreur traitement ${holiday.titre}:`, error);
            }
        }

        //console.log('\nRésumé:');
        //console.table(results);
        return results;
    } catch (error) {
        //console.error('Erreur globale:', error);
        throw error;
    }
};

const syncDeadlineEvents = async () => {
    try {
        const projects = await Project.find()
            .populate('owner', 'nom email')
            .populate('members', 'nom email');

        const createdEvents = [];
        
        for (const project of projects) {
            const existingEvent = await Event.findOne({
                type: 'Deadline',
                projet_id: project._id,  
                date_fin: project.end_date
            });

            if (!existingEvent) {
                const deadlineEvent = new Event({
                    type: 'Deadline',
                    titre: project.name,
                    description: project.description,
                    date_debut: project.start_date,
                    date_fin: project.end_date,
                    organisateur_id: project.owner,
                    projet_id: project._id,
                    status: 'Confirme'
                });

                await deadlineEvent.save();

                if (project.members?.length > 0) {
                    const participantsData = project.members.map(member => ({
                        event_id: deadlineEvent._id,
                        id_participant: member,
                        organisateur_id: project.owner,
                        reponse: 'accepter'
                    }));

                    try {
                        await Participant.insertMany(participantsData);
                    } catch (insertError) {
                        //console.error('Erreur d\'insertion des participants dans Deadline Event:', insertError);
                    }
                }

                createdEvents.push(deadlineEvent);
            } else {
                // Mise à jour de l'événement si nécessaire
                if (existingEvent.date_fin.getTime() !== project.end_date.getTime()) {
                    existingEvent.date_fin = project.end_date;
                    await existingEvent.save();
                }
                createdEvents.push(existingEvent);
            }
        }

        return createdEvents;
    } catch (error) {
        //console.error('Erreur lors de la synchronisation des événements de deadline:', error);
    }
};

const getEvents = async (req, res) => {
    try {
        // Synchronisation des événements Holiday et Deadline
        await Promise.all([syncHolidayEvents(), syncDeadlineEvents()]);

        // Récupérer tous les événements
        const events = await Event.find()
            .populate('organisateur_id', 'nom prenom email')
            .lean();

        // Récupérer tous les participants en une seule requête
        const allParticipants = await Participant.find({
            event_id: { $in: events.map(e => e._id) }
        }).populate('id_participant', 'nom email').lean();

        // Organiser les participants par event_id
        const participantsByEvent = allParticipants.reduce((acc, p) => {
            if (!acc[p.event_id]) {
                acc[p.event_id] = [];
            }
            acc[p.event_id].push({
                id: p.id_participant._id,
                nom: p.id_participant.nom,
                email: p.id_participant.email,
                reponse: p.reponse
            });
            return acc;
        }, {});

        // Combiner les événements avec leurs participants
        const eventsWithParticipants = events.map(event => ({
            ...event,
            participants: participantsByEvent[event._id] || []
        }));

        res.status(200).json(eventsWithParticipants);
    } catch (err) {
        //console.error('Erreur lors de la récupération des événements:', err);
        res.status(400).json({ message: err.message });
    }
};


const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organisateur_id', 'nom prenom email')
            .lean();
                
        if (!event) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }

        const participants = await Participant.find({ event_id: event._id })
            .populate('id_participant', 'nom email')
            .lean();

        const eventWithParticipants = {
            ...event,
            participants: participants.map(p => ({
                id: p.id_participant._id,
                nom: p.id_participant.nom,
                email: p.id_participant.email,
                reponse: p.reponse
            }))
        };

        res.status(200).json(eventWithParticipants);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const createEvent = async (req, res) => {
    try {
        const eventData = {
            ...req.body,
           // date_debut: new Date(req.body.date_debut).toISOString(),
           // date_fin: new Date(req.body.date_fin).toISOString(),
            organisateur_id: req.user._id
        };

        // Validation des types d'événements
        if (eventData.type === 'Holiday' || eventData.type === 'Deadline') {
            return res.status(403).json({
                success: false,
                message: `Vous ne pouvez pas créer un événement de type ${eventData.type}.`
            });
        }

        // Vérification pour les tâches
        if (eventData.type === 'Tâche' && req.body.participants?.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Les tâches ne peuvent pas avoir de participants.'
            });
        }

        // Vérification que seules les tâches peuvent avoir des rappels personnalisés
        if (req.body.rappel && eventData.type !== 'Tâche') {
            return res.status(403).json({
                success: false,
                message: 'Seules les tâches peuvent avoir des rappels personnalisés.'
            });
        }

        // Vérification des participants pour les types Réunion et Événement
        if (['Réunion', 'Événement'].includes(eventData.type)) {
            if (!Array.isArray(req.body.participants)) {
                eventData.participants = req.body.participants ? [req.body.participants] : [];
            } else {
                eventData.participants = req.body.participants;
            }

            // Filtrer l'organisateur des participants
            eventData.participants = eventData.participants.filter(
                participantId => participantId.toString() !== req.user._id.toString()
            );

            if (eventData.participants.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Vous devez ajouter au moins un invité à l'événement."
                });
            }

            // Vérifier l'existence des participants
            const existingUsers = await Utilisateur.find({
                _id: { $in: eventData.participants }
            });

            if (existingUsers.length !== eventData.participants.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Certains participants n\'existent pas dans la base de données.'
                });
            }
        }

        // Génération du lien Jitsi si type Réunion/Événement et en ligne
        if (['Réunion', 'Événement'].includes(eventData.type) && eventData.emplacement === 'En ligne') {
            eventData.lien = generateJitsiLink(eventData.titre || 'event', eventData.date_debut);
        }

        // Gestion du fichier
        if (req.file) {
            eventData.file = `/uploads/${req.file.filename}`;
        }

        // Gestion des rappels selon le type d'événement
        switch (eventData.type) {
            case 'Tâche':
                if (!req.body.rappel || !Array.isArray(req.body.rappel) || req.body.rappel.length === 0) {
                    eventData.rappel = [{ time: 15, unit: 'minutes', sent: false }];
                } else {
                    eventData.rappel = req.body.rappel.map(r => ({
                        time: r.time,
                        unit: r.unit,
                        sent: false
                    }));
                }
                break;

            case 'Réunion':
            case 'Événement':
                eventData.rappel = [
                    { time: 1, unit: 'hours', sent: false },
                    { time: 30, unit: 'minutes', sent: false },
                    { time: 15, unit: 'minutes', sent: false },
                    { time: 10, unit: 'minutes', sent: false },
                    { time: 5, unit: 'minutes', sent: false }
                ];
                break;

            case 'Deadline':
            case 'Holiday':
                eventData.rappel = [
                    { time: 1, unit: 'days', sent: false }
                ];
                break;
        }

        // Validation récurrence personnalisée
        if (eventData.isRecurring && eventData.type_recurrence === 'personnalise') {
            if (!eventData.custom_recurrence_days || eventData.custom_recurrence_days < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Pour une récurrence personnalisée, spécifiez un nombre de jours valide (ex: 2, 3, 5...)'
                });
            }
        }

        // Création de l'événement
        const event = new Event(eventData);
        await event.save();
        await scheduleEventReminders(event);

        // Enregistrement des participants et envoi des emails
        if (['Réunion', 'Événement'].includes(eventData.type) && eventData.participants?.length > 0) {
            // Création des participants
            const participantsData = eventData.participants.map(participantId => ({
                event_id: event._id,
                id_participant: participantId,
                organisateur_id: req.user._id
            }));

            await Participant.insertMany(participantsData);

            // Envoi des emails aux participants
            try {
                const fullParticipants = await Utilisateur.find({
                    _id: { $in: eventData.participants }
                });

                console.log(`Envoi des emails à ${fullParticipants.length} participants`);

                for (const participant of fullParticipants) {
                    if (participant.email) {
                        console.log(`Préparation de l'email pour ${participant.email}`);
                        const emailData = emailService.getEventCreationEmail(event, participant, participant.email);
                        await emailService.sendEmail(participant.email, emailData);
                        console.log(`Email envoyé avec succès à ${participant.email}`);
                    }
                }
            } catch (error) {
                console.error("Erreur lors de l'envoi des emails :", error);
            }
        }

        res.status(201).json({
            success: true,
            data: event
        });
    } catch (err) {
        console.error('Erreur lors de la création de l\'événement:', err);
        res.status(400).json({ message: err.message });
    }
};

  
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Événement non trouvé'
            });
        }

        if (event.type === 'Deadline') {
            if (event.organisateur_id.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Seul l\'organisateur peut modifier la deadline'
                });
            }

            const updatedEvent = await Event.findByIdAndUpdate(
                req.params.id,
                { date_fin: req.body.date_fin },
                { new: true }
            );

            if (event.projet_id) {
                await Project.findByIdAndUpdate(event.projet_id, {
                    end_date: req.body.date_fin
                });
            }

            return res.status(200).json({
                success: true,
                data: updatedEvent
            });
        }
        if (event.type === 'Holiday') {
            return res.status(403).json({
                success: false,
                message: 'Les événements de type Holiday ne peuvent pas être modifiés.'
            });
        }

        if (event.organisateur_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'êtes pas l\'organisateur de cet événement'
            });
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json({
            success: true,
            data: updatedEvent
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Événement non trouvé'
            });
        }
         if (event.type === 'Holiday') {
            return res.status(403).json({
                success: false,
                message: 'Les événements de type Holiday ne peuvent pas être supprimés.'
            });
        }
        if (event.organisateur_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'êtes pas l\'organisateur de cet événement.'
            });
        }

        await Promise.all([
            Event.findByIdAndDelete(req.params.id),
            Participant.deleteMany({ event_id: req.params.id })
        ]);

        res.status(200).json({
            success: true,  
            message: 'Événement supprimé.'
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getEventsByOrganisateur = async (req, res) => {
    try {
        const events = await Event.find({ organisateur_id: req.user._id })
            .populate('organisateur_id', 'nom prenom email')
            .lean();

        const allParticipants = await Participant.find({
            event_id: { $in: events.map(e => e._id) }
        }).populate('id_participant', 'nom email').lean();

        const participantsByEvent = allParticipants.reduce((acc, p) => {
            if (!acc[p.event_id]) {
                acc[p.event_id] = [];
            }
            acc[p.event_id].push({
                id: p.id_participant._id,
                nom: p.id_participant.nom,
                email: p.id_participant.email,
                reponse: p.reponse
            });
            return acc;
        }, {});

       

        res.status(200).json(eventsWithParticipants);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getEventsByParticipant = async (req, res) => {
    try {
        const participations = await Participant.find({ id_participant: req.user._id })
            .populate({
                path: 'event_id',
                populate: { path: 'organisateur_id', select: 'nom prenom email' }
            })
            .populate('id_participant', 'nom email')
            .lean();

        const eventsWithParticipants = participations.map(participation => ({
            ...participation.event_id,
            participants: [{
                id: participation.id_participant._id,
                nom: participation.id_participant.nom,
                email: participation.id_participant.email,
                reponse: participation.reponse
            }]
        }));

        res.status(200).json(eventsWithParticipants);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};





const getEventsByUser = async (req, res) => {
    try {
        // Synchroniser les événements
        await Promise.all([
            syncHolidayEvents(),
            syncDeadlineEvents()
        ]);

        // Récupérer les événements où l'utilisateur est organisateur
        const organizerEvents = await Event.find({ organisateur_id: req.user._id })
            .populate('organisateur_id', 'nom prenom email')
            .lean();

        // Récupérer les événements où l'utilisateur est participant
        const participantEvents = await Participant.find({ id_participant: req.user._id })
            .populate({
                path: 'event_id',
                populate: { path: 'organisateur_id', select: 'nom prenom email' }
            })
            .lean();

        // Récupérer les événements Holiday
        const holidayEvents = await Event.find({ type: 'Holiday' })
            .populate('organisateur_id', 'nom prenom email')
            .lean();

        // Combiner tous les événements
        const allEvents = [
            ...organizerEvents,
            ...participantEvents.map(p => p.event_id),
            ...holidayEvents
        ];

        // Récupérer tous les participants
        const allParticipants = await Participant.find({
            event_id: { $in: allEvents.map(e => e._id) }
        }).populate('id_participant', 'nom email').lean();

        const participantsByEvent = allParticipants.reduce((acc, p) => {
            if (!acc[p.event_id]) {
                acc[p.event_id] = [];
            }
            acc[p.event_id].push({
                id: p.id_participant._id,
                nom: p.id_participant.nom,
                email: p.id_participant.email,
                reponse: p.reponse
            });
            return acc;
        }, {});

        const eventsWithParticipants = allEvents.map(event => ({
            ...event,
            participants: participantsByEvent[event._id] || []
        }));

        

        res.status(200).json(uniqueEvents);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const deleteHolidayAndDeadlineEvents = async (req, res) => {
    try {
        // Trouver tous les événements à supprimer
        const eventsToDelete = await Event.find({
            type: { $in: ['Holiday', 'Deadline'] }
        });

        const eventIds = eventsToDelete.map(event => event._id);

        // Supprimer les participants associés à ces événements
        await Participant.deleteMany({
            event_id: { $in: eventIds }
        });

        // Supprimer les événements eux-mêmes
        await Event.deleteMany({
            _id: { $in: eventIds }
        });

        res.status(200).json({
            message: 'Tous les événements de type Holiday ou Deadline et leurs participants ont été supprimés.',
            count: eventIds.length
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
/*
const generateGoogleMeetLink = (eventTitle) => {
    const baseUrl = "https://meet.google.com/";
    const meetingId = eventTitle.split(' ').join('-').toLowerCase(); // Générer un ID de réunion à partir du titre
    return baseUrl + meetingId;
};*/



const generateJitsiLink = (titre, date) => {
    const baseUrl = "https://meet.jit.si";
    const roomName = `${titre.replace(/\s+/g, '_')}_${Date.now()}`;
    return `${baseUrl}/${roomName}`;
};

const searchEvents = async (req, res) => {
    try {
        const { type, search } = req.query; 
        let query = {};

        if (type) {
            query.type = type;
        }
        if (search) {
            // Recherche insensible à la casse et partielle dans le titre
            query.titre = { $regex: search, $options: 'i' };
        }

        // Récupération des événements et des participants (même logique qu'avant)
        const events = await Event.find(query)
            .populate('organisateur_id', 'nom prenom email')
            .lean();

        const allParticipants = await Participant.find({
            event_id: { $in: events.map(e => e._id) }
        }).populate('id_participant', 'nom email').lean();

        const participantsByEvent = allParticipants.reduce((acc, p) => {
            if (!acc[p.event_id]) acc[p.event_id] = [];
            acc[p.event_id].push({
                id: p.id_participant._id,
                nom: p.id_participant.nom,
                email: p.id_participant.email,
                reponse: p.reponse
            });
            return acc;
        }, {});

        const eventsWithParticipants = events.map(event => ({
            ...event,
            participants: participantsByEvent[event._id] || []
        }));

        res.status(200).json(eventsWithParticipants);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
const searchByUser = async (req, res) => {
    try {

        const { email } = req.query;
        let userQuery = {};


            // Recherche partielle insensible à la casse
            userQuery.email = { $regex: email, $options: 'i' };
        

        const users = await Utilisateur.find(userQuery, 'nom prenom email');

        res.status(200).json(users);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};



module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventsByOrganisateur,
    getEventsByParticipant,getEventsByUser,deleteHolidayAndDeadlineEvents, 
    searchEvents,searchByUser
};

