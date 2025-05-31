
const schedule = require('node-schedule');
const Event = require('../models/Event');
const emailService = require('../config/nodemailer');
const mongoose = require('mongoose');

const scheduledJobs = new Map();

async function scheduleEventReminders(event) {
    try {
        //console.log(` Planification des rappels pour: ${event.titre}`);
        //console.log(`Type: ${event.type}, ID: ${event._id}`);
        
        // Add default reminders if necessary
        if (!event.rappel || event.rappel.length === 0) {
            let defaultReminders = [];
            
            switch (event.type) {
                case 'Tâche':
                    defaultReminders = [{ time: 30, unit: 'minutes', sent: false }];
                    break;
                case 'Deadline':
                case 'Holiday':
                    defaultReminders = [{ time: 1, unit: 'days', sent: false }];
                    break;
                case 'Réunion':
                case 'Événement':
                    defaultReminders = [
                        { time: 1, unit: 'hours', sent: false },
                        { time: 30, unit: 'minutes', sent: false }, 
                        { time: 10, unit: 'minutes', sent: false }, 
                        { time: 5, unit: 'minutes', sent: false },
                        { time: 15, unit: 'minutes', sent: false },



                    ];
                    break;
            }

            if (defaultReminders.length > 0) {
                event = await Event.findByIdAndUpdate(
                    event._id,
                    { $set: { rappel: defaultReminders } },
                    { new: true }
                );
                //console.log(`📅 Rappels par défaut ajoutés pour ${event.type}`);
            }
        }
        
        const useEndDate = ['Deadline', 'Holiday'].includes(event.type);
        const eventDate = new Date(useEndDate ? event.date_fin : event.date_debut);
        
        // Convert to UTC
        const eventUTC = new Date(eventDate.toISOString());
        //console.log(`📅 Date de l'événement (UTC): ${eventUTC.toISOString()}`);
        
        cancelScheduledReminders(event._id);

        if (!event.rappel || event.rappel.length === 0) {
            //console.log("❌ Aucun rappel défini pour cet événement");
            return;
        }

        for (const [index, reminder] of event.rappel.entries()) {
            if (reminder.sent) {
                //console.log(`⏭️ Rappel déjà envoyé, ignoré`);
                continue;
            }

            const reminderTime = calculateReminderTime(eventUTC, reminder, event.type);
            
            if (!reminderTime) {
                //console.log("⚠️ L'heure du rappel est dans le passé, ignoré");
                continue;
            }

            //console.log(`🕒 Heure calculée pour le rappel (UTC): ${reminderTime.toISOString()}`);
            
            const jobKey = `${event._id}_${index}`;

            const job = schedule.scheduleJob(reminderTime, async function() {
                try {
                    //console.log(`🔔 Exécution du rappel pour: ${event.titre}`);
                    
                    const updatedEvent = await Event.findById(event._id)
                        .populate({
                            path: 'organisateur_id',
                            select: 'email nom'
                        })
                        .exec();

                    if (!updatedEvent) {
                        //console.error(" Événement non trouvé");
                        return;
                    }

                    if (!updatedEvent.rappel[index].sent) {
                        await sendReminderEmail(updatedEvent, reminder);
                        
                        updatedEvent.rappel[index].sent = true;
                        await updatedEvent.save();
                        
                        //console.log(`Rappel envoyé avec succès pour: ${event.titre}`);
                    }
                } catch (error) {
                    //console.error(' Erreur lors de l\'exécution du rappel:', error);
                }
            });

            scheduledJobs.set(jobKey, job);
            //console.log(` Rappel programmé: ${jobKey}`);
        }
    } catch (error) {
        //console.error(' Erreur lors de la planification des rappels:', error);
    }
}

function calculateReminderTime(eventDate, reminder, eventType) {
    try {
        const now = new Date();
        const date = new Date(eventDate);
        
        let offsetMs = 0;
        switch (reminder.unit) {
            case 'minutes':
                offsetMs = reminder.time * 60 * 1000;
                break;
            case 'hours':
                offsetMs = reminder.time * 60 * 60 * 1000;
                break;
            case 'days':
                offsetMs = reminder.time * 24 * 60 * 60 * 1000;
                break;
            default:
                //console.error('Unité de temps non reconnue:', reminder.unit);
                return null;
        }
        
        let reminderTime = new Date(date.getTime() - offsetMs);

        if (['Deadline', 'Holiday'].includes(eventType)) {
            reminderTime.setUTCHours(14, 46, 0, 0);
        }
        
        // Add 30-second tolerance  
        const tolerance = 30 * 1000;
        return reminderTime > new Date(now.getTime() - tolerance) ? reminderTime : null;
    } catch (error) {
        //console.error(' Erreur lors du calcul du temps de rappel:', error);
        return null;
    }
}

async function sendReminderEmail(event, reminder) {
    try {
        //console.log(` Début d'envoi des rappels pour ${event.titre}`);
        
        const timeLeft = `${reminder.time} ${
            reminder.unit === 'minutes' ? 'minute(s)' : 
            reminder.unit === 'hours' ? 'heure(s)' : 'jour(s)'
        }`;

        const organizer = await mongoose.model('Utilisateur')
            .findById(event.organisateur_id)
            .select('email nom')
            .exec();
        
        if (organizer?.email) {
            const organizerEmail = emailService.getReminderEmail(event, timeLeft, organizer.email);
            await emailService.sendEmail(organizer.email, organizerEmail);
            //console.log(` Email envoyé à l'organisateur: ${organizer.email}`);
        }

        if (['Réunion', 'Événement','Deadline', 'Holiday'].includes(event.type)) {
            const participants = await mongoose.model('Participant')
                .find({ event_id: event._id })
                .populate('id_participant', 'email nom')
                .exec();

            //console.log(` ${participants.length} participants trouvés`);

            for (const participant of participants) {
                if (participant.id_participant?.email && 
                    (!organizer || participant.id_participant.email !== organizer.email)) {
                    try {
                        const participantEmail = emailService.getReminderEmail(
                            event,
                            timeLeft,
                            participant.id_participant.email
                        );
                        await emailService.sendEmail(participant.id_participant.email, participantEmail);
                        //console.log(` Email envoyé à: ${participant.id_participant.email}`);
                    } catch (error) {
                        //console.error(` Échec envoi à ${participant.id_participant.email}:`, error);
                    }
                }
            }
        }
    } catch (error) {
        //console.error(' Erreur critique dans sendReminderEmail:', error);
        throw error;
    }
}

function cancelScheduledReminders(eventId) {
    try {
        const prefix = eventId.toString();
        for (const [key, job] of scheduledJobs.entries()) {
            if (key.startsWith(prefix)) {
                job.cancel();
                scheduledJobs.delete(key);
                //console.log(`🚫 Rappel annulé: ${key}`);
            }
        }
    } catch (error) {
        //console.error('❌ Erreur lors de l\'annulation des rappels:', error);
    }
}

async function loadPendingReminders() {
    try {
        const now = new Date();
        //console.log(` Heure actuelle (UTC): ${now.toISOString()}`);
        
        const threeDaysFromNow = new Date(now);
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        
        //console.log(` Recherche des événements jusqu'au: ${threeDaysFromNow.toISOString()}`);

        const events = await Event.find({
            status: { $ne: 'Annule' },
            $or: [
                {
                    type: { $in: ['Deadline', 'Holiday'] },
                    date_fin: {
                        $gt: now,
                        $lt: threeDaysFromNow
                    }
                },
                {
                    type: { $nin: ['Deadline', 'Holiday'] },
                    date_debut: {
                        $gt: now,
                        $lt: threeDaysFromNow
                    }
                }
            ],
            $or: [
                { rappel: { $size: 0 } },
                { 'rappel.sent': false }
            ]
        })
        .populate('organisateur_id')
        .exec();

        //console.log(` Nombre d'événements trouvés: ${events.length}`);
        
        for (const event of events) {
            //console.log(`\n Traitement de l'événement:`);
            //console.log(`   Titre: ${event.titre}`);
            //console.log(`   Type: ${event.type}`);
            //console.log(`   Date: ${event.type === 'Deadline' || event.type === 'Holiday' ? event.date_fin : event.date_debut}`);
            //console.log(`   Rappels: ${JSON.stringify(event.rappel)}`);
            await scheduleEventReminders(event);
        }
    } catch (error) {
        //console.error(' Erreur lors du chargement des rappels en attente:', error);
    }
}

// Initialize: load reminders at startup
loadPendingReminders();

// Check for reminders every 15 seconds
setInterval(loadPendingReminders, 15 * 1000);

module.exports = {
    scheduleEventReminders,
    cancelScheduledReminders,
    loadPendingReminders
};


