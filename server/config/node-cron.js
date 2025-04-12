const cron = require('node-cron');
const Event = require('../models/Event');
const Participant = require('../models/Participant');
const Utilisateur = require('../models/Usermodel');
const emailService = require('./emailservice');

async function checkAndSendReminders() {
  try {
    console.log('🔍 Vérification des rappels:', new Date().toISOString());
    
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    console.log('Recherche d\'événements entre:', now.toISOString());
    console.log('et:', twoHoursFromNow.toISOString());

    const events = await Event.find({
      $or: [
        {
          type: { $in: ['Réunion', 'Événement'] },
          date_debut: {
            $gte: now,
            $lte: twoHoursFromNow
          },
          reminderSent: { $ne: true }
        },
        {
          type: 'Holiday',
          date_debut: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2)
          },
          reminderSent: { $ne: true }
        },
        {
          type: 'Deadline',
          date_fin: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2)
          },
          reminderSent: { $ne: true }
        }
      ]
    }).populate('organisateur_id');

    console.log('📅 Événements trouvés:', events.length);

    for (let event of events) {
      console.log(`\n📌 Traitement de l'événement: ${event.titre} (${event.type})`);
      
      // Envoyer le rappel à l'organisateur
      if (event.organisateur_id) {
        try {
          console.log(`📧 Envoi du rappel à l'organisateur: ${event.organisateur_id.email}`);
          const emailContent = emailService.getEventReminderEmail(
            event,
            event.organisateur_id,
            event.organisateur_id.email,
            event.type === 'Réunion' || event.type === 'Événement' ? "dans deux heures" : "demain"
          );
          await emailService.sendEmail(event.organisateur_id.email, emailContent);
          console.log(`✅ Email envoyé à l'organisateur`);
        } catch (error) {
          console.error(`❌ Erreur d'envoi à l'organisateur:`, error);
        }
      }

      // Envoyer aux participants
      const participants = await Participant.find({ event_id: event._id })
        .populate('id_participant');
      
      console.log(`👥 Nombre de participants: ${participants.length}`);

      for (const participant of participants) {
        if (!participant.id_participant) continue;
        
        try {
          console.log(`📧 Envoi du rappel au participant: ${participant.id_participant.email}`);
          
          const emailContent = emailService.getEventReminderEmail(
            event,
            participant.id_participant,
            participant.id_participant.email,
            event.type === 'Réunion' || event.type === 'Événement' ? "dans deux heures" : "demain"
          );

          await emailService.sendEmail(participant.id_participant.email, emailContent);
          console.log(`✅ Email envoyé avec succès à ${participant.id_participant.email}`);
        } catch (error) {
          console.error(`❌ Erreur d'envoi pour ${participant.id_participant.email}:`, error);
        }
      }

      // Marquer l'événement comme rappelé
      await Event.updateOne(
        { _id: event._id },
        { $set: { reminderSent: true } }
      );
      console.log(`✅ Événement marqué comme rappelé: ${event._id}`);
    }
  } catch (error) {
    console.error("❌ Erreur générale lors de l'envoi des rappels:", error);
  }
}

// Exécuter toutes les minutes pour le test
cron.schedule('* * * * *', checkAndSendReminders);

module.exports = { checkAndSendReminders };