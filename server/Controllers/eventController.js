    const Event = require('../models/Event');
    const Holiday = require('../models/Holiday'); 
    const Utilisateur = require('../models/Usermodel'); 
    const { Project } = require('../models/ProjectModel');    
     const emailService = require('../config/nodemailer');
    const { scheduleEventReminders } = require('../services/reminderScheduler');
    const mongoose = require('mongoose');
    const { createRecurringEventInstances, deleteRecurringEventInstances, updateRecurringEventInstances } = require('../services/recurringEventService');
    const isAdmin = require("../Middleware/adminorganisation");
    //const User = require("../models/Usermodel");
    const syncHolidayEvents = async () => {
        try {
            // Récupération des données
            const [allUsers, holidays] = await Promise.all([
                Utilisateur.User.find({}, '_id nom email'), 
                Holiday.find()
            ]);
            
            const results = [];

            // Pour chaque holiday
            for (const holiday of holidays) {
                try {
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

                    // Obtenir les IDs des participants actuels
                    const currentParticipantIds = new Set(
                        event.participants?.map(p => p.participant_id?.toString()) || []
                    );

                    // Ajouter les utilisateurs manquants
                    const participantsToAdd = allUsers.filter(user => 
                        !currentParticipantIds.has(user._id.toString())
                    );

                    if (participantsToAdd.length > 0) {
                        const newParticipants = participantsToAdd.map(user => ({
                            participant_id: user._id,
                            accept: true, // Pour les holidays, on accepte par défaut
                            refuse: false,
                            message: ''
                        }));

                        // Mettre à jour l'événement avec les nouveaux participants
                        await Event.findByIdAndUpdate(
                            event._id,
                            { 
                                $push: { 
                                    participants: { 
                                        $each: newParticipants 
                                    } 
                                } 
                            }
                        );
                    }

                    results.push({
                        event: event._id,
                        title: event.titre,
                        existingParticipants: currentParticipantIds.size,
                        addedParticipants: participantsToAdd.length,
                        totalParticipants: currentParticipantIds.size + participantsToAdd.length
                    });

                } catch (error) {
                    //console.error(`Erreur traitement ${holiday.titre}:`, error);
                }
            }

            return results;
        } catch (error) {
            throw error;
        }
    };

const syncDeadlineEvents = async () => {
    try {
        // Vérification que Project est bien un modèle Mongoose valide
        if (!Project || typeof Project.find !== 'function') {
            throw new Error('Project model is not properly initialized');
        }

        const projects = await Project.find({ 
            end_date: { $exists: true, $ne: null } 
        })
        .populate('owner', 'nom email')
        .populate('members', 'nom email');

        const createdEvents = [];
        
        for (const project of projects) {
            try {
                if (!project.end_date) continue;

                const existingEvent = await Event.findOne({
                    type: 'Deadline',
                    projet_id: project._id
                });

                const deadlineDate = new Date(project.end_date);
                
                if (!existingEvent) {
                    const deadlineEvent = new Event({
                        type: 'Deadline',
                        titre: `Échéance: ${project.name}`,
                        description: project.description || `Date limite pour ${project.name}`,
                        date_debut: deadlineDate,
                        date_fin: deadlineDate,
                        organisateur_id: project.owner?._id,
                        projet_id: project._id,
                        status: 'Confirme',
                        participants: project.members?.map(member => ({
                            participant_id: member._id,
                            accept: false,
                            refuse: false,
                            message: ''
                        })) || [],
                        isAutoGenerated: true
                    });

                    await deadlineEvent.save();
                    createdEvents.push(deadlineEvent);
                } else {
                        // 5. Mettre à jour l'événement existant
                        let updated = false;
                        
                        // Vérifier les dates
                        if (existingEvent.date_fin.getTime() !== deadlineDate.getTime()) {
                            existingEvent.date_debut = deadlineDate;
                            existingEvent.date_fin = deadlineDate;
                            updated = true;
                        }

                        // Vérifier le titre
                        const newTitle = `Échéance: ${project.name}`;
                        if (existingEvent.titre !== newTitle) {
                            existingEvent.titre = newTitle;
                            updated = true;
                        }

                        // Mettre à jour les participants
                        const currentParticipants = existingEvent.participants.map(p => p.participant_id?.toString());
                        const newMembers = project.members?.filter(member => 
                            !currentParticipants.includes(member._id.toString())
                        ) || [];

                        if (newMembers.length > 0) {
                            newMembers.forEach(member => {
                                existingEvent.participants.push({
                                    participant_id: member._id,
                                    accept: false,
                                    refuse: false,
                                    message: ''
                                });
                            });
                            updated = true;
                        }

                        if (updated) {
                            await existingEvent.save();
                            createdEvents.push({
                                action: 'updated',
                                event: existingEvent
                            });
                        }
                    }
                } catch (error) {
                    console.error(`Erreur lors du traitement du projet ${project.name}:`, error);
                }
            }

            return createdEvents;
        } catch (error) {
            console.error('Erreur dans syncDeadlineEvents:', error);
            throw error;
        }
    };
    const getEvents = async (req, res) => {
        try {
            // Synchronisation des événements Holiday et Deadline
            await Promise.all([syncHolidayEvents(), syncDeadlineEvents()]);

            // Récupérer tous les événements avec les références résolues
            const events = await Event.find()
                .populate('organisateur_id', 'nom prenom email')
                .populate('participants.participant_id', 'nom prenom email')
                .lean();

            // Formater les données pour la réponse
            const formattedEvents = events.map(event => {
                // Format participants for consistency with old API
                const formattedParticipants = event.participants?.map(p => ({
                    id: p.participant_id?._id,
                    nom: p.participant_id?.nom,
                    email: p.participant_id?.email,
                    reponse: p.accept ? 'accepter' : (p.refuse ? 'refuser' : 'en_attente')
                })) || [];

                return {
                    ...event,
                    participants: formattedParticipants
                };
            });

            res.status(200).json(formattedEvents);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    };

    const getEventById = async (req, res) => {
        try {
            const event = await Event.findById(req.params.id)
                .populate('organisateur_id', 'nom prenom email')
                .populate('participants.participant_id', 'nom prenom email')
                .lean();
                    
            if (!event) {
                return res.status(404).json({ message: 'Événement non trouvé' });
            }

            // Formater les participants pour être compatibles avec l'ancien format
            const formattedParticipants = event.participants?.map(p => ({
                id: p.participant_id?._id,
                nom: p.participant_id?.nom,
                email: p.participant_id?.email,
                reponse: p.accept ? 'accepter' : (p.refuse ? 'refuser' : 'en_attente')
            })) || [];

            const formattedEvent = {
                ...event,
                participants: formattedParticipants
            };

            res.status(200).json(formattedEvent);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    };

const createEvent = async (req, res) => {
    try {
        console.log('--- Debugging Create Event Controller ---');
        console.log('Sanitized request body:', req.body);
        console.log('Authenticated user:', req.user);

        const eventData = {
            ...req.body,
            organisateur_id: req.user._id
        };

        console.log('Initial eventData:', eventData);

        // Convert string boolean to actual boolean for isRecurring
        if (eventData.isRecurring === 'true' || eventData.isRecurring === true) {
            eventData.isRecurring = true;
        } else if (eventData.isRecurring === 'false' || eventData.isRecurring === false) {
            eventData.isRecurring = false;
        }

        // Si l'événement a un type_recurrence autre que 'none', définir isRecurring à true
        if (eventData.type_recurrence && eventData.type_recurrence !== 'none') {
            eventData.isRecurring = true;
        }

        console.log('Processed eventData after isRecurring conversion:', eventData);

        // Validate event type
        if (['Holiday', 'Deadline'].includes(eventData.type)) {
            console.log('Invalid event type:', eventData.type);
            return res.status(403).json({
                success: false,
                message: `Vous ne pouvez pas créer un événement de type ${eventData.type}.`
            });
        }

        // Process participants for "Réunion" and "Évenement"
        let participantUsers = []; // Stocker les utilisateurs participants
        if (['Réunion', 'Évenement'].includes(eventData.type)) {
            console.log('Processing participants for event type:', eventData.type);
            let participantIds = Array.isArray(req.body.participants)
                ? req.body.participants
                : (req.body.participants ? [req.body.participants] : []);

            console.log('Initial participant IDs:', participantIds);

            // Validate each participant ID
            for (const participantId of participantIds) {
                if (!mongoose.Types.ObjectId.isValid(participantId)) {
                    console.log('Invalid participant ID:', participantId);
                    return res.status(400).json({
                        success: false,
                        message: `L'ID du participant ${participantId} n'est pas valide.`
                    });
                }
            }

            // Exclude the organizer from the participants
            participantIds = participantIds.filter(
                participantId => participantId.toString() !== req.user._id.toString()
            );

            console.log('Filtered participant IDs (excluding organizer):', participantIds);

            if (participantIds.length === 0) {
                console.log('No valid participants after filtering.');
                return res.status(400).json({
                    success: false,
                    message: "Vous devez ajouter au moins un invité à l'événement."
                });
            }

            // Verify participants exist in the database
            const existingUsers = await Utilisateur.User.find({
                _id: { $in: participantIds }
            });

            console.log('Existing users found in database:', existingUsers);

            if (existingUsers.length !== participantIds.length) {
                console.log('Some participants do not exist in the database.');
                return res.status(400).json({
                    success: false,
                    message: 'Certains participants n\'existent pas dans la base de données.'
                });
            }

            // Stocker les utilisateurs participants pour l'envoi d'emails
            participantUsers = existingUsers;

            // Prepare participants for the event
            eventData.participants = participantIds.map(id => ({
                participant_id: id,
                accept: false,
                refuse: false,
                message: ''
            }));
            console.log('Prepared participants for the event:', eventData.participants);
        }

        // Set reminders based on event type
        console.log('Setting reminders for event type:', eventData.type);
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
            case 'Évenement':
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
        console.log('Set reminders for the event:', eventData.rappel);

        // Enhanced validation for recurring events
        if (eventData.isRecurring) {
            console.log('Validating recurring event data:', eventData);

            // Validate recurrence type
            const validRecurrenceTypes = ['daily', 'weekly', 'monthly', 'yearly', 'personnalise'];
            if (!eventData.type_recurrence || !validRecurrenceTypes.includes(eventData.type_recurrence)) {
                console.log('Invalid recurrence type:', eventData.type_recurrence);
                return res.status(400).json({
                    success: false,
                    message: 'Type de récurrence invalide. Utilisez: daily, weekly, monthly, yearly, ou personnalise.'
                });
            }

            // Validate custom recurrence
            if (eventData.type_recurrence === 'personnalise') {
                if (!eventData.custom_recurrence_days || eventData.custom_recurrence_days < 1) {
                    console.log('Invalid custom recurrence days:', eventData.custom_recurrence_days);
                    return res.status(400).json({
                        success: false,
                        message: 'Pour une récurrence personnalisée, spécifiez un nombre de jours valide (ex: 2, 3, 5...)'
                    });
                }
                eventData.custom_recurrence_days = parseInt(eventData.custom_recurrence_days);
            }

            // Validate end date for recurring events
            if (eventData.recurrence_end_date) {
                const endDate = new Date(eventData.recurrence_end_date);
                const startDate = new Date(eventData.date_debut);

                if (endDate <= startDate) {
                    console.log('Invalid recurrence end date:', eventData.recurrence_end_date);
                    return res.status(400).json({
                        success: false,
                        message: 'La date de fin de récurrence doit être postérieure à la date de début.'
                    });
                }
            }
        }
        
        eventData.lien = generateJitsiLink(eventData.titre || 'event', eventData.date_debut);
        
        if (req.file) {
            eventData.file = `/uploads/${req.file.filename}`;
        }

        console.log('Final event data before saving:', eventData);

        // Create the base event
        const event = new Event(eventData);
        await event.save();
        console.log('Base event created successfully:', event);
await scheduleEventReminders(event);

        // Generate recurring instances if needed
        let createdEvents = [event];
        if (eventData.isRecurring && eventData.type_recurrence !== 'none') {
            console.log('Creating recurring instances...');
            createdEvents = await createRecurringEventInstances(event);
            console.log(`Created ${createdEvents.length} recurring instances`);
        }


        console.log('Reminders scheduled successfully for all instances.');

        // ============== ENVOI D'EMAILS AUX PARTICIPANTS ==============
        if (['Réunion', 'Évenement'].includes(eventData.type) && participantUsers.length > 0) {
            console.log('Sending invitation emails to participants...');
            
            try {
                // Récupérer les informations de l'organisateur
                const organizer = await Utilisateur.User.findById(req.user._id);
                
                // Envoyer un email à chaque participant
                for (const participant of participantUsers) {
                    try {
                        // Générer le contenu de l'email d'invitation
                        const emailContent = emailService.getEventCreationEmail(
                            event, 
                            participant, 
                            participant.email
                        );
                        
                        // Envoyer l'email
                        await emailService.sendEmail(participant.email, emailContent);
                        console.log(`✅ Email d'invitation envoyé à: ${participant.email}`);
                        
                    } catch (emailError) {
                        console.error(`❌ Erreur envoi email à ${participant.email}:`, emailError);
                        // Continue avec les autres participants même si un email échoue
                    }
                }
                
                console.log('📧 Tous les emails d\'invitation ont été traités');
                
            } catch (emailProcessError) {
                console.error('❌ Erreur lors du processus d\'envoi des emails:', emailProcessError);
                // L'événement est créé même si les emails échouent
            }
        }

        res.status(201).json({
            success: true,
            data: event,
            message: eventData.isRecurring ? 
                `Événement récurrent créé avec ${createdEvents.length} instances. Invitations envoyées aux participants.` : 
                'Événement créé avec succès. Invitations envoyées aux participants.',
            instances_created: createdEvents.length,
            participants_notified: participantUsers.length
        });
        
    } catch (err) {
        console.error('Erreur lors de la création de l\'événement:', err);

        // More specific error handling
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: 'Erreur de validation: ' + errors.join(', ')
            });
        }

        if (err.name === 'TypeError' && err.message.includes('branch is not a function')) {
            return res.status(400).json({
                success: false,
                message: 'Erreur de type de données. Vérifiez les valeurs booléennes et les types de récurrence.'
            });
        }

        res.status(400).json({
            success: false,
            message: err.message || 'Erreur lors de la création de l\'événement'
        });
    }
};
const updateEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const updateData = req.body;
        const userId = req.user.id;

        console.log('Mise à jour de l\'événement:', eventId);
        console.log('Données reçues:', updateData);

        // Vérifier que l'événement existe et appartient à l'utilisateur
        const existingEvent = await Event.findById(eventId);
        if (!existingEvent) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }

        // Vérifier les permissions (organisateur ou admin)
        if (existingEvent.organisateur_id.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Vous n\'avez pas les permissions pour modifier cet événement' });
        }

        // Validation des dates
        if (updateData.date_debut && updateData.date_fin) {
            const startDate = new Date(updateData.date_debut);
            const endDate = new Date(updateData.date_fin);

            if (endDate <= startDate) {
                return res.status(400).json({ message: 'La date de fin doit être postérieure à la date de début' });
            }
        }

        // Gestion des participants
        let addedParticipants = [];
        let removedParticipants = [];
        
        if (updateData.participants && Array.isArray(updateData.participants)) {
            const currentParticipants = existingEvent.participants.map(p => 
                p.participant_id ? p.participant_id.toString() : p.toString()
            );
            const newParticipants = updateData.participants;

            // Identifier les participants ajoutés et supprimés
            addedParticipants = newParticipants.filter(p => !currentParticipants.includes(p));
            removedParticipants = currentParticipants.filter(p => !newParticipants.includes(p));

            // Transformer en format attendu par le modèle
            updateData.participants = newParticipants.map(participantId => ({
                participant_id: participantId,
                status: 'invited'
            }));

            console.log('Participants ajoutés:', addedParticipants);
            console.log('Participants supprimés:', removedParticipants);
        }

        // Vérifier si c'est un événement récurrent ou si la récurrence change
        const isCurrentlyRecurring = existingEvent.isRecurring && existingEvent.type_recurrence !== 'none';
        const willBeRecurring = updateData.isRecurring && updateData.type_recurrence && updateData.type_recurrence !== 'none';
        const recurrenceChanging = updateData.hasOwnProperty('isRecurring') || updateData.hasOwnProperty('type_recurrence');

        console.log('Actuellement récurrent:', isCurrentlyRecurring);
        console.log('Sera récurrent:', willBeRecurring);
        console.log('Récurrence en changement:', recurrenceChanging);

        let result;

        if (isCurrentlyRecurring || willBeRecurring || recurrenceChanging) {
            // Utiliser le service de récurrence pour gérer la mise à jour
            console.log('Utilisation du service de récurrence...');
            result = await updateRecurringEventInstances(eventId, updateData);
            
            res.status(200).json({
                message: 'Événement récurrent mis à jour avec succès',
                event: result.parentEvent,
                instancesCount: result.instances ? result.instances.length : result.instancesUpdated || 0,
                addedParticipants,
                removedParticipants,
                recurrenceMessage: result.message
            });
        } else {
            // Mise à jour simple pour événement non récurrent
            console.log('Mise à jour simple...');
            const updatedEvent = await Event.findByIdAndUpdate(
                eventId,
                { $set: updateData },
                { new: true, runValidators: true }
            ).populate('participants.participant_id', 'nom prenom email')
             .populate('organisateur_id', 'nom prenom email');

            if (!updatedEvent) {
                return res.status(404).json({ message: 'Événement non trouvé après mise à jour' });
            }

            res.status(200).json({
                message: 'Événement mis à jour avec succès',
                event: updatedEvent,
                addedParticipants,
                removedParticipants
            });
        }

    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'événement:', error);
        res.status(500).json({ 
            message: 'Erreur serveur lors de la mise à jour de l\'événement',
            error: error.message 
        });
    }
};

const getEventsByParticipant = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(400).json({ message: 'Utilisateur non authentifié.' });
        }

        // Trouver les événements où l'utilisateur est un participant
        const events = await Event.find({
            'participants.participant_id': req.user._id
        })
        .populate('organisateur_id', 'nom prenom email')
        .populate('participants.participant_id', 'nom prenom email')
        .lean();

        // Formater les événements pour la réponse
        const formattedEvents = events.map(event => {
            // Récupérer juste les informations du participant actuel pour maintenir la compatibilité
            const currentParticipant = event.participants.find(
                p => p.participant_id && p.participant_id._id.toString() === req.user._id.toString()
            );

            const formattedParticipant = currentParticipant ? {
                id: currentParticipant.participant_id._id,
                nom: currentParticipant.participant_id.nom,
                email: currentParticipant.participant_id.email,
                reponse: currentParticipant.accept ? 'accepter' : (currentParticipant.refuse ? 'refuser' : 'en_attente')
            } : null;

            return {
                ...event,
                participants: formattedParticipant ? [formattedParticipant] : []
            };
        });

        res.status(200).json(formattedEvents);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
const updateParticipantResponse = async (req, res) => {
    try {
        const { id } = req.params;
        const { response, message } = req.body;
        const userId = req.user._id;

        if (!['accepter', 'refuser', 'en_attente'].includes(response)) {
            return res.status(400).json({
                success: false,
                message: 'Réponse invalide. Utilisez "accepter", "refuser" ou "en_attente".'
            });
        }

        const event = await Event.findById(id);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Événement non trouvé'
            });
        }

        // Trouver l'index du participant dans le tableau
        const participantIndex = event.participants.findIndex(
            p => p.participant_id && p.participant_id.toString() === userId.toString()
        );

        if (participantIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Vous n\'êtes pas invité à cet événement'
            });
        }

        // Mettre à jour la réponse du participant
        const updateData = {};
        updateData[`participants.${participantIndex}.accept`] = response === 'accepter';
        updateData[`participants.${participantIndex}.refuse`] = response === 'refuser';
        
        if (message) {
            updateData[`participants.${participantIndex}.message`] = message;
        }

        await Event.findByIdAndUpdate(id, { $set: updateData });

        // Récupérer l'événement mis à jour avec les informations complètes
        const updatedEvent = await Event.findById(id)
            .populate('organisateur_id', 'nom prenom email')
            .populate('participants.participant_id', 'nom prenom email');

        // ============== ENVOI D'EMAIL À L'ORGANISATEUR ==============
        try {
            // Récupérer les informations du participant qui répond
            const participant = await Utilisateur.User.findById(userId);
            
            if (participant && updatedEvent.organisateur_id && updatedEvent.organisateur_id.email) {
                console.log('Envoi d\'email de notification à l\'organisateur...');
                
                // Préparer les informations du participant pour l'email
                const participantInfo = {
                    nom: participant.nom + ' ' + (participant.prenom || ''),
                    reponse: response === 'accepter' ? 'Accepté' : 
                            response === 'refuser' ? 'Refusé' : 'En attente',
                    message: message || 'Aucun message'
                };

                // Générer le contenu de l'email de notification
                const emailContent = emailService.getParticipantResponseEmail(
                    updatedEvent,
                    participantInfo,
                    updatedEvent.organisateur_id.email
                );

                // Envoyer l'email à l'organisateur
                await emailService.sendEmail(updatedEvent.organisateur_id.email, emailContent);
                console.log(`✅ Email de notification envoyé à l'organisateur: ${updatedEvent.organisateur_id.email}`);
                
            } else {
                console.log('❗ Impossible d\'envoyer l\'email: informations manquantes');
            }
            
        } catch (emailError) {
            console.error('❌ Erreur lors de l\'envoi de l\'email à l\'organisateur:', emailError);
            // La réponse est enregistrée même si l'email échoue
        }

        res.status(200).json({
            success: true,
            message: `Votre réponse a été enregistrée et l'organisateur a été notifié.`,
            data: updatedEvent
        });
        
    } catch (err) {
        console.error('Erreur lors de la mise à jour de la réponse:', err);
        res.status(400).json({ 
            success: false,
            message: err.message 
        });
    }
};


const addParticipants = async (req, res) => {
    try {
        const { id } = req.params;
        const { participants } = req.body;

        if (!Array.isArray(participants) || participants.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Veuillez fournir une liste valide de participants.'
            });
        }

        // Vérifier si l'événement existe
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Événement non trouvé.'
            });
        }

        // Vérifier si l'utilisateur est l'organisateur de l'événement
        if (event.organisateur_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'êtes pas autorisé à ajouter des participants à cet événement.'
            });
        }

        // Ajouter les participants à l'événement
        for (const participantId of participants) {
            // Vérifiez que `participantId` est une chaîne valide
            if (!mongoose.Types.ObjectId.isValid(participantId)) {
                return res.status(400).json({
                    success: false,
                    message: `L'ID du participant ${participantId} n'est pas valide.`
                });
            }

            const participant = await Utilisateur.findById(participantId);
            if (!participant) {
                return res.status(404).json({
                    success: false,
                    message: `Participant avec ID ${participantId} non trouvé.`
                });
            }

            // Vérifier si le participant est déjà dans la liste
            const existingParticipant = event.participants.find(
                p => p.participant_id.toString() === participantId.toString()
            );
            if (existingParticipant) {
                return res.status(400).json({
                    success: false,
                    message: `Participant avec ID ${participantId} est déjà ajouté à cet événement.`
                });
            }

            // Ajouter le participant
            event.participants.push({
                participant_id: participantId,
                accept: false,
                refuse: false,
                message: ''
            });
        }

        await event.save();

        res.status(200).json({
            success: true,
            message: 'Participants ajoutés avec succès.',
            data: event
        });
    } catch (error) {
        console.error('Erreur lors de l\'ajout des participants:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de l\'ajout des participants.'
        });
    }
};
const deleteParticipant = async (req, res) => {
    try {
        const { id, participantId } = req.params;

        // Vérifier que l'ID est valide
        if (!mongoose.Types.ObjectId.isValid(participantId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de participant invalide'
            });
        }

        // Trouver l'événement
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Événement non trouvé'
            });
        }

        // Vérifier les permissions
        if (event.organisateur_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Vous ne pouvez pas modifier cet événement'
            });
        }

        // Trouver l'index du participant
        const participantIndex = event.participants.findIndex(
            p => p.participant_id.toString() === participantId
        );

        if (participantIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Participant non trouvé dans cet événement'
            });
        }

        // Supprimer le participant
        event.participants.splice(participantIndex, 1);
        await event.save();

        res.status(200).json({
            success: true,
            message: 'Participant supprimé avec succès',
            data: event
        });

    } catch (error) {
        console.error('Erreur suppression participant:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur serveur'
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

        const user = await Utilisateur.User.findById(req.user.id);
        const isAdmin = user.role === 'admin' || user.role === 'manager';
        console.log(isAdmin)
        if (event.organisateur_id.toString() !== req.user._id.toString() && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'êtes pas l\'organisateur de cet événement.'
            });
        }

        // Si c'est un événement récurrent (parent ou instance), supprimer toutes les instances
        if (event.isRecurring || event.parent_event_id) {
            const parentId = event.parent_event_id || event._id;
            await deleteRecurringEventInstances(parentId);
            
            return res.status(200).json({
                success: true,  
                message: 'Série d\'événements récurrents supprimée.'
            });
        } else {
            // Événement simple
            await Event.findByIdAndDelete(req.params.id);
            
            return res.status(200).json({
                success: true,  
                message: 'Événement supprimé.'
            });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


const validateRecurringEventData = (eventData) => {
    // Convert string booleans to actual booleans
    if (typeof eventData.isRecurring === 'string') {
        eventData.isRecurring = eventData.isRecurring.toLowerCase() === 'true';
    }

    // Validate and convert numeric fields
    if (eventData.custom_recurrence_days && typeof eventData.custom_recurrence_days === 'string') {
        eventData.custom_recurrence_days = parseInt(eventData.custom_recurrence_days);
    }

    if (eventData.recurrence_count && typeof eventData.recurrence_count === 'string') {
        eventData.recurrence_count = parseInt(eventData.recurrence_count);
    }

    return eventData;
};

const sanitizeEventData = (req, res, next) => {
    console.log('--- Debugging Sanitize Event Data Middleware ---');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Raw request body:', req.body);
    
    try {
        // Si c'est une requête FormData (multer)
        if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
            console.log('Processing FormData request');
            
            // Traiter les participants
            if (req.body['participants[]']) {
                if (Array.isArray(req.body['participants[]'])) {
                    req.body.participants = req.body['participants[]'];
                } else {
                    req.body.participants = [req.body['participants[]']];
                }
                delete req.body['participants[]'];
            } else if (req.body.participants) {
                // Si les participants sont envoyés comme JSON string
                try {
                    req.body.participants = JSON.parse(req.body.participants);
                } catch (e) {
                    console.log('Participants is not JSON, treating as array');
                    if (!Array.isArray(req.body.participants)) {
                        req.body.participants = [req.body.participants];
                    }
                }
            } else {
                req.body.participants = [];
            }

            // Traiter les rappels - FormData structure: rappel[0][time], rappel[0][unit], rappel[0][sent]
            const rappelData = {};
            const rappelKeys = Object.keys(req.body).filter(key => key.startsWith('rappel['));
            
            rappelKeys.forEach(key => {
                const match = key.match(/rappel\[(\d+)\]\[(\w+)\]/);
                if (match) {
                    const index = parseInt(match[1]);
                    const property = match[2];
                    
                    if (!rappelData[index]) {
                        rappelData[index] = {};
                    }
                    
                    let value = req.body[key];
                    // Convertir les types appropriés
                    if (property === 'time') {
                        value = parseInt(value);
                    } else if (property === 'sent') {
                        value = value === 'true';
                    }
                    
                    rappelData[index][property] = value;
                    delete req.body[key];
                }
            });

            // Convertir l'objet rappel en tableau
            if (Object.keys(rappelData).length > 0) {
                req.body.rappel = Object.keys(rappelData)
                    .sort((a, b) => parseInt(a) - parseInt(b))
                    .map(key => rappelData[key]);
            } else if (req.body.rappel) {
                // Si rappel est envoyé comme JSON string
                try {
                    req.body.rappel = JSON.parse(req.body.rappel);
                } catch (e) {
                    console.log('Rappel is not JSON, setting empty array');
                    req.body.rappel = [];
                }
            } else {
                req.body.rappel = [];
            }

            // Convertir les valeurs booléennes
            if (req.body.isRecurring) {
                req.body.isRecurring = req.body.isRecurring === 'true';
            }

            // Nettoyer les autres champs si nécessaire
            Object.keys(req.body).forEach(key => {
                if (req.body[key] === 'undefined' || req.body[key] === 'null') {
                    delete req.body[key];
                }
            });

        } else {
            // Si c'est une requête JSON normale
            console.log('Processing JSON request');
            
            // S'assurer que participants est un tableau
            if (!req.body.participants) {
                req.body.participants = [];
            } else if (!Array.isArray(req.body.participants)) {
                req.body.participants = [req.body.participants];
            }

            // S'assurer que rappel est un tableau
            if (!req.body.rappel) {
                req.body.rappel = [];
            } else if (!Array.isArray(req.body.rappel)) {
                req.body.rappel = [req.body.rappel];
            }
        }

        console.log('Processed request body:', req.body);
        console.log('Participants array:', req.body.participants);
        console.log('Rappel array:', req.body.rappel);
        
        next();
    } catch (error) {
        console.error('Error in sanitizeEventData middleware:', error);
        return res.status(400).json({
            success: false,
            message: 'Erreur lors du traitement des données: ' + error.message
        });
    }
};



const getEventsByOrganisateur = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(400).json({ message: 'Utilisateur non authentifié.' });
        }

        // Récupérer les événements où l'utilisateur est organisateur
        const events = await Event.find({ organisateur_id: req.user._id })
            .populate('organisateur_id', 'nom prenom email')
            .populate('participants.participant_id', 'nom prenom email')
            .lean();

        // Formater les événements pour la réponse
        const formattedEvents = events.map(event => {
            const formattedParticipants = event.participants?.map(p => ({
                id: p.participant_id?._id,
                nom: p.participant_id?.nom,
                email: p.participant_id?.email,
                reponse: p.accept ? 'accepter' : (p.refuse ? 'refuser' : 'en_attente')
            })) || [];

            return {
                ...event,
                participants: formattedParticipants
            };
        });

        res.status(200).json(formattedEvents);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};



const getEventsByUser = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(400).json({ message: 'Utilisateur non authentifié.' });
        }
  
        // Récupérer tous les événements pertinents pour l'utilisateur
        const [organizerEvents, participantEvents, holidayEvents] = await Promise.all([
            // Événements dont l'utilisateur est l'organisateur
            Event.find({ organisateur_id: userId })
                .populate('organisateur_id', 'nom prenom email')
                .populate('participants.participant_id', 'nom prenom email')
                .lean(),
  
            // Événements dont l'utilisateur est participant
            Event.find({ 'participants.participant_id': userId })
                .populate('organisateur_id', 'nom prenom email')
                .populate('participants.participant_id', 'nom prenom email')
                .lean(),
  
            // Événements de type Holiday
            Event.find({ type: 'Holiday' })
                .populate('organisateur_id', 'nom prenom email')
                .populate('participants.participant_id', 'nom prenom email')
                .lean()
        ]);
  
        // Éviter les doublons avec une map par _id
        const eventMap = new Map();
  
        for (const e of [...organizerEvents, ...participantEvents, ...holidayEvents]) {
            eventMap.set(e._id.toString(), e);
        }
  
        // Formater les événements pour la réponse
        const formattedEvents = Array.from(eventMap.values()).map(event => {
            const formattedParticipants = event.participants?.map(p => ({
                id: p.participant_id?._id,
                nom: p.participant_id?.nom,
                email: p.participant_id?.email,
                reponse: p.accept ? 'accepter' : (p.refuse ? 'refuser' : 'en_attente')
            })) || [];

            return {
                ...event,
                participants: formattedParticipants
            };
        });
  
        res.status(200).json(formattedEvents);
    } catch (err) {
        console.error('Erreur dans getEventsByUser:', err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};



const deleteHolidayAndDeadlineEvents = async (req, res) => {
    try {
        // Trouver tous les événements à supprimer
        const eventsToDelete = await Event.find({
            type: { $in: ['Holiday', 'Deadline'] }
        });

        const eventIds = eventsToDelete.map(event => event._id);

        // Supprimer les événements
        await Event.deleteMany({
            _id: { $in: eventIds }
        });

        res.status(200).json({
            message: 'Tous les événements de type Holiday ou Deadline ont été supprimés.',
            count: eventIds.length
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const generateJitsiLink = (titre, date) => {
    const baseUrl = "https://meet.jit.si";
    const roomName = `${titre.replace(/\s+/g, '_')}_${Date.now()}`;
    return `${baseUrl}/${roomName}`;
};

const searchEvents = async (req, res) => {
    try {
        const { type, search } = req.query;
        const userId = req.user._id; // L'utilisateur connecté (doit être fourni par le middleware d'authentification)
        
        // Construction de la requête de base
        let query = {
            $or: [
                { organisateur_id: userId }, // Événements où l'utilisateur est organisateur
                { 'participants.participant_id': userId } // Événements où l'utilisateur est participant
            ]
        };

        // Ajout des filtres optionnels
        if (type) {
            query.type = type;
        }
        
        if (search) {
            query.titre = { $regex: search, $options: 'i' };
        }

        // Récupération des événements
        const events = await Event.find(query)
            .populate('organisateur_id', 'nom prenom email')
            .populate('participants.participant_id', 'nom prenom email')
            .lean();

        // Formater les résultats
        const formattedEvents = events.map(event => {
            const formattedParticipants = event.participants?.map(p => ({
                id: p.participant_id?._id,
                nom: p.participant_id?.nom,
                email: p.participant_id?.email,
                reponse: p.accept ? 'accepter' : (p.refuse ? 'refuser' : 'en_attente')
            })) || [];

            return {
                ...event,
                participants: formattedParticipants,
                // Ajout optionnel pour identifier le rôle de l'utilisateur
                userRole: event.organisateur_id._id.equals(userId) ? 'Organisateur' : 'Participant'
            };
        });

        res.status(200).json(formattedEvents);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

      

// Modifiez la fonction searchByUser dans votre backend
const searchByUser = async (req, res) => {
    try {
        const { email } = req.query;
        
        // Trouver l'utilisateur par email
        const user = await Utilisateur.findOne({ email: { $regex: email, $options: 'i' } });
        
        if (!user) {
            return res.status(200).json([]);
        }

        // Rechercher les événements où l'utilisateur est organisateur ou participant
        const events = await Event.find({
            $or: [
                { organisateur_id: user._id },
                { 'participants.participant_id': user._id }
            ]
        })
        .populate('organisateur_id', 'nom prenom email')
        .populate('participants.participant_id', 'nom prenom email')
        .lean();

        // Formater les résultats
        const formattedEvents = events.map(event => {
            const formattedParticipants = event.participants?.map(p => ({
                id: p.participant_id?._id,
                nom: p.participant_id?.nom,
                email: p.participant_id?.email,
                reponse: p.accept ? 'accepter' : (p.refuse ? 'refuser' : 'en_attente')
            })) || [];

            return {
                ...event,
                participants: formattedParticipants,
                userRole: event.organisateur_id._id.equals(user._id) ? 'Organisateur' : 'Participant'
            };
        });

        res.status(200).json({
            userInfo: {
                nom: user.nom,
                prenom: user.prenom,
                email: user.email
            },
            events: formattedEvents
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
// TO DO : controller to add multi participants to an event

    

// TO DO : controller to update the response of a participant 
// const updateReponse = async (req, res) => {
//     try {
//         const { event_id } = req.params;
//         const { reponse } = req.body;

//         if (!['accepter', 'refuser', 'en_attente'].includes(reponse)) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Réponse invalide. Utilisez "accepter", "refuser" ou "en_attente".'
//             });
//         }

//         // Vérifier si l'événement existe
//         const event = await Event.findById(event_id);
//         if (!event) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Événement non trouvé.'
//             });
//         }

//         // Vérifier si l'utilisateur est un participant de l'événement
//         const participant = event.participants.find(
//             p => p.participant_id.toString() === req.user._id.toString()
//         );
//         if (!participant) {
//             return res.status(403).json({
//                 success: false,
//                 message: 'Vous n\'êtes pas un participant de cet événement.'
//             });
//         }
//         // Mettre à jour la réponse du participant
//         participant.accept = reponse === 'accepter';
//         participant.refuse = reponse === 'refuser';
//         await event.save();
//         res.status(200).json({
//             success: true,
//             message: `Votre réponse a été mise à jour avec succès.`,
//             data: event
//         });

//     } catch (error) {
//         console.error('Erreur lors de la mise à jour de la réponse du participant:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Erreur serveur lors de la mise à jour de la réponse.'
//         });
//     }
// }

//Fonction pour récupérer le statut du participant selon event et id de user connecté 
const participant_status = async (eventId, userId) => {
    try {
        const event = await Event.findById(eventId).populate('participants.participant_id', 'nom prenom email');
        if (!event) {
            throw new Error('Événement non trouvé');
        }

        const participant = event.participants.find(p => 
            p.participant_id && p.participant_id._id.toString() === userId.toString()
        );

        if (!participant) {
            return {
                statut: 'en_attente',
                message: '',
                participantDetails: null
            };
        }

        let statut = 'en_attente';
        if (participant.accept) {
            statut = 'accepter';
        } else if (participant.refuse) {
            statut = 'refuser';
        }

        return {
            statut,
            message: participant.message || '',
            participantDetails: {
                nom: participant.participant_id.nom,
                prenom: participant.participant_id.prenom,
                email: participant.participant_id.email
            }
        };
    } catch (error) {
        console.error('Erreur lors de la récupération du statut du participant:', error);
        throw error;
    }
};

const getEventWithParticipants = async (req, res) => {
    try {
        const eventId = req.params.eventId; // Changez 'id' en 'eventId' pour correspondre à la route
        
        if (!eventId) {
            return res.status(400).json({ message: 'ID d\'événement manquant.' });
        }

        // Trouver l'événement avec tous les participants peuplés
        const event = await Event.findById(eventId)
            .populate('organisateur_id', 'nom prenom email')
            .populate('participants.participant_id', 'nom prenom email')
            .lean();

        if (!event) {
            return res.status(404).json({ message: 'Événement non trouvé.' });
        }

        // Formater les participants pour la réponse
        const formattedParticipants = event.participants.map(participant => {
            return {
                participant_id: participant.participant_id, // objet complet peuplé
                accept: participant.accept,
                refuse: participant.refuse,
                message: participant.message
            };
        });

        // Créer la réponse formatée
        const response = {
            ...event,
            participants: formattedParticipants
        };

        res.status(200).json(response);
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
    getEventsByParticipant,
    getEventsByUser,
    updateParticipantResponse,
    deleteHolidayAndDeadlineEvents,
    searchEvents,
    searchByUser,
    addParticipants,
    validateRecurringEventData,
    sanitizeEventData, 
    deleteParticipant, 
    participant_status,
    getEventWithParticipants
    // updateReponse
};

