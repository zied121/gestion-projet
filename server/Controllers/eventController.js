const Event = require('../models/Event');

const Holiday = require('../models/Holiday'); 
const Participant = require('../models/Participant');
const Utilisateur = require('../models/Usermodel'); 
const Project = require('../models/ProjectModel');
const emailService = require('../config/emailservice');
const { checkAndSendReminders } = require('../config/node-cron');

const syncHolidayEvents = async () => {
    const holidays = await Holiday.find();
    const createdEvents = [];
    for (const holiday of holidays) {
        const existingEvent = await Event.findOne({
            type: 'Holiday',
            date_debut: holiday.date,
            titre: holiday.titre,
        });
        if (!existingEvent) {
            const holidayEvent = new Event({
                type: 'Holiday',
                titre: holiday.titre,
                description: holiday.description,
                date_debut: holiday.date,
                date_fin: holiday.date,
                organisateur_id: null,  
                status: 'Confirme'
            });
            await holidayEvent.save();
            createdEvents.push(holidayEvent);
        }
    }
    return createdEvents;
};
// Fonction utilitaire pour synchroniser les événements Deadline
const syncDeadlineEvents = async () => {
    const projects = await Project.find()
        .populate('owner', 'nom email')
        .populate('members', 'nom email');
     const createdEvents = [];
    for (const project of projects) {
        // Vérification de l'existence de l'événement Deadline
        const existingEvent = await Event.findOne({
            type: 'Deadline',
            projet_id: project._id,  
            date_fin: project.end_date });
        if (!existingEvent) {
            // Créer un nouvel événement Deadline s'il n'existe pas
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
            // Ajouter les participants à l'event
            if (project.members?.length > 0) {
                const participantsData = project.members.map(member => ({
                    event_id: deadlineEvent._id,
                    id_participant: member,
                    organisateur_id: project.owner,
                    reponse: 'accepter'
                }));
                await Participant.insertMany(participantsData);
            }
            createdEvents.push(deadlineEvent);
        } else {
            // Si l'événement existe déjà, mettre à jour si nécessaire 
            if (existingEvent.date_fin.getTime() !== project.end_date.getTime()) {
                existingEvent.date_fin = project.end_date;
                await existingEvent.save();
            }
            createdEvents.push(existingEvent);
        }
    }

    return createdEvents;
};


const getEvents = async (req, res) => {
    try {
        // Synchronisation des événements Holiday et Deadline
        await Promise.all([
            syncHolidayEvents(),  
            syncDeadlineEvents()  
        ]);
        // Récupérer tous les événements avec leurs détails
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

        res.status(200).json(eventsWithParticipants);  // Retourner la réponse avec les événements et participants
    } catch (err) {
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
  
      // Vérification des participants pour les types Réunion et Événement
      if (['Réunion', 'Événement'].includes(eventData.type) && req.body.participants?.length > 0) {
        let participants = req.body.participants.filter(
          participantId => participantId.toString() !== req.user._id.toString()
        );
  
        if (participants.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Vous devez ajouter au moins un invité à l'événement."
          });
        }
  
        const existingUsers = await Utilisateur.find({
          _id: { $in: participants }
        });
  
        if (existingUsers.length !== participants.length) {
          return res.status(400).json({
            success: false,
            message: 'Certains participants n\'existent pas dans la base de données.'
          });
        }
  
        eventData.participants = participants;
      }
  
      // Génération du lien Jitsi si type Réunion/Événement et en ligne
      if (['Réunion', 'Événement'].includes(eventData.type) && eventData.emplacement === 'En ligne') {
        eventData.lien = generateJitsiLink(eventData.titre || 'event', eventData.date_debut);
      }
      if (req.file) {
        eventData.file = `/uploads/${req.file.filename}`;
      }
  
      // Création de l'événement
      const event = new Event(eventData);
      await event.save();

  
      // Enregistrement des participants
      if (['Réunion', 'Événement'].includes(eventData.type) && eventData.participants?.length > 0) {
        const participantsData = eventData.participants.map(participantId => ({
          event_id: event._id,
          id_participant: participantId,
          organisateur_id: req.user._id
        }));
  
        await Participant.insertMany(participantsData);
      }
//mail
if (['Réunion', 'Événement'].includes(event.type) && eventData.participants?.length > 0) {
    try {
  
      const fullParticipants = await Utilisateur.find({
        _id: { $in: eventData.participants }
      });
  
  
      for (const participant of fullParticipants) {

  
  
        const emailData = emailService.getEventCreationEmail(event, participant, participant.email);
  
        try {
          await emailService.sendEmail(participant.email, emailData);
        } catch (error) {
          console.error(`Erreur lors de l'envoi de l'email à ${participant.email} :`, error);
        }
      }
  
      console.log("✅ Tous les emails ont été envoyés.");
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi des emails :", error);
    }
  }
  await checkAndSendReminders();
  
  
      // Réponse de succès
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

        const eventsWithParticipants = events.map(event => ({
            ...event,
            participants: participantsByEvent[event._id] || []
        }));
        await checkAndSendReminders();

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

        // Retirer les doublons
        const uniqueEvents = eventsWithParticipants.filter((value, index, self) => 
            index === self.findIndex((t) => (
                t._id.toString() === value._id.toString()
            ))
        );
        await checkAndSendReminders();

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




module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventsByOrganisateur,
    getEventsByParticipant,getEventsByUser,deleteHolidayAndDeadlineEvents
};