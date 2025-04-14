

/*async function checkAndSendReminders() {
    try {
      console.log('Vérification des rappels:', new Date().toISOString());
      
      const now = new Date();
      
      // Rappel pour les Réunion et Événements : 1 heure avant
      const oneHourFromNow = new Date(now.getTime() + 1 * 60 * 60 * 1000);
      
      // Rappel pour les Holidays et Deadlines : 1 jour avant
      const oneDayFromNow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
      
      console.log('Recherche d\'événements entre:', now.toISOString());
      console.log('et:', oneDayFromNow.toISOString());
      
      const events = await Event.find({
        reminderSent: { $ne: true },
        $or: [
          {
            type: { $in: ['Réunion', 'Événement'] },
            date_debut: {
              $gte: now,
              $lte: oneHourFromNow // Rappel 1 heure avant pour les événements de type Réunion ou Événement
            },
            reminderSent: { $ne: true }
          },
          {
            type: 'Holiday',
            date_debut: {
              $gte: oneDayFromNow, // Rappel 1 jour avant pour les événements de type Holiday
              $lt: new Date(oneDayFromNow.getTime() + 1 * 24 * 60 * 60 * 1000) // 1 jour après
            },
            reminderSent: { $ne: true }
          },
          {
            type: 'Deadline',
            date_fin: {
              $gte: oneDayFromNow, // Rappel 1 jour avant pour les événements de type Deadline
              $lt: new Date(oneDayFromNow.getTime() + 1 * 24 * 60 * 60 * 1000)
            },
            reminderSent: { $ne: true }
          }
        ]
      }).populate('organisateur_id');
  
      console.log('Événements trouvés:', events.length);
  
      for (let event of events) {
        console.log(`\n Traitement de l'événement: ${event.titre} (${event.type})`);
        const eventCheck = await Event.findOne({
            _id: event._id,
            reminderSent: true
          });
          if (eventCheck) {
            console.log(` Rappel déjà envoyé pour l'événement: ${event.titre}`);
            continue;
          }
  
        // Envoi du rappel à l'organisateur
        if (event.organisateur_id) {
          try {
            console.log(` Envoi du rappel à l'organisateur: ${event.organisateur_id.email}`);
            const emailContent = emailService.getEventReminderEmail(
              event,
              event.organisateur_id,
              event.organisateur_id.email,
              event.type === 'Réunion' || event.type === 'Événement' ? "dans une heure" : event.type === 'Holiday' ? "demain" : "dans un jour"
            );
            await emailService.sendEmail(event.organisateur_id.email, emailContent);
            console.log(` Email envoyé à l'organisateur`);
          } catch (error) {
            console.error(` Erreur d'envoi à l'organisateur:`, error);
          }
        }
  
        // Envoi des rappels aux participants
        const participants = await Participant.find({ event_id: event._id })
          .populate('id_participant');
        
        console.log(` Nombre de participants: ${participants.length}`);
  
        for (const participant of participants) {
          if (!participant.id_participant) continue;
          
          try {
            console.log(` Envoi du rappel au participant: ${participant.id_participant.email}`);
            
            const emailContent = emailService.getEventReminderEmail(
              event,
              participant.id_participant,
              participant.id_participant.email,
              event.type === 'Réunion' || event.type === 'Événement' ? "dans une heure" : event.type === 'Holiday' ? "demain" : "dans un jour"
            );
  
            await emailService.sendEmail(participant.id_participant.email, emailContent);
            console.log(` Email envoyé avec succès à ${participant.id_participant.email}`);
          } catch (error) {
            console.error(` Erreur d'envoi pour ${participant.id_participant.email}:`, error);
          }
        }
  
        // Marquer l'événement comme rappelé
        await Event.updateOne(
          { _id: event._id },
          { $set: { reminderSent: true } }
        );
        console.log(` Événement marqué comme rappelé: ${event._id}`);
      }
    } catch (error) {
      console.error(" Erreur générale lors de l'envoi des rappels:", error);
    }
  }
  cron.schedule('* * * * * *', checkAndSendReminders); // Toutes les 10 secondes pour les tests*/
  const cron = require('node-cron');
  const Event = require('../models/Event');
  const Participant = require('../models/Participant');
  const Utilisateur = require('../models/Usermodel');
  const emailService = require('./emailservice');
  
  async function checkAndSendReminders() {
    try {
      console.log('Vérification des rappels:', new Date().toISOString());
      
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 1 * 60 * 60 * 1000);
      
      // Pour Holiday et Deadline, on vérifie si on est à 22h la veille
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
  
      const isReminderTime = now.getHours() === 22;
      
      // Recherche uniquement les événements qui n'ont pas encore reçu de rappel
      const events = await Event.find({
        reminderSent: false,
        $or: [
          {
            type: { $in: ['Réunion', 'Événement'] },
            date_debut: {
              $gt: now,
              $lte: oneHourFromNow
            }
          },
          ...(isReminderTime ? [
            {
              type: 'Holiday',
              date_debut: {
                $gte: tomorrow,
                $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
              }
            },
            {
              type: 'Deadline',
              date_fin: {
                $gte: tomorrow,
                $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
              }
            }
          ] : [])
        ]
      }).populate('organisateur_id');
  
      if (events.length === 0) {
        return;
      }
  
      console.log('Nouveaux événements à rappeler:', events.length);
  
      for (let event of events) {
        const updateResult = await Event.updateOne(
          { 
            _id: event._id,
            reminderSent: false
          },
          { $set: { reminderSent: true } }
        );
  
        if (updateResult.modifiedCount === 0) {
          console.log(` Événement déjà traité: ${event.titre}`);
          continue;
        }
  
        console.log(`\n Traitement de l'événement: ${event.titre} (${event.type})`);
  
        // Envoi du rappel à l'organisateur
        if (event.organisateur_id) {
          try {
            console.log(` Envoi du rappel à l'organisateur: ${event.organisateur_id.email}`);
            const emailContent = emailService.getEventReminderEmail(
              event,
              event.organisateur_id,
              event.organisateur_id.email,
              event.type === 'Réunion' || event.type === 'Événement' 
                ? "dans une heure" 
                : "demain"
            );
            await emailService.sendEmail(event.organisateur_id.email, emailContent);
            console.log(` Email envoyé à l'organisateur`);
          } catch (error) {
            console.error(` Erreur d'envoi à l'organisateur:`, error);
          }
        }
  
        // Envoi aux participants
        const participants = await Participant.find({ event_id: event._id })
          .populate('id_participant');
        
        console.log(` Nombre de participants: ${participants.length}`);
  
        for (const participant of participants) {
          if (!participant.id_participant) continue;
          
          try {
            console.log(` Envoi du rappel au participant: ${participant.id_participant.email}`);
            
            const emailContent = emailService.getEventReminderEmail(
              event,
              participant.id_participant,
              participant.id_participant.email,
              event.type === 'Réunion' || event.type === 'Événement' 
                ? "dans une heure" 
                : "demain"
            );
  
            await emailService.sendEmail(participant.id_participant.email, emailContent);
            console.log(` Email envoyé avec succès à ${participant.id_participant.email}`);
          } catch (error) {
            console.error(` Erreur d'envoi pour ${participant.id_participant.email}:`, error);
          }
        }
      }
    } catch (error) {
      console.error(" Erreur générale lors de l'envoi des rappels:", error);
    }
  }
  
  // Exécuter toutes les minutes
  cron.schedule('5 * * * * *', checkAndSendReminders);
  
  module.exports = { checkAndSendReminders };