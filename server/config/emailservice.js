const nodemailer = require('nodemailer');
const emailConfig = require('./mail');

const transporter = nodemailer.createTransport({
  service: emailConfig.service,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass
  }
});

function getEventCreationEmail(event, user, recipientEmail) {
  return {
    from: emailConfig.user,
    to: recipientEmail,
    subject: `Invitation à ${event.type} : ${event.titre}`,
    text: `Bonjour ${user.nom || 'invité'},\n\nVous êtes invité à ${event.type} "${event.titre}" qui aura lieu du ${new Date(event.date_debut).toLocaleString()} au ${new Date(event.date_fin).toLocaleString()}.\n\nLieu: ${event.emplacement}${event.lien ? `\nLien : ${event.lien}` : ''}\n\nMerci.`,
    html: `
      <p>Bonjour <strong>${user.nom || 'invité'}</strong>,</p>
      <p>Vous êtes invité à <strong>${event.type}</strong> : <em>${event.titre}</em>.</p>
      <p><strong>Date :</strong> du ${new Date(event.date_debut).toLocaleString()} au ${new Date(event.date_fin).toLocaleString()}</p>
      <p><strong>Lieu :</strong> ${event.emplacement}</p>
      ${event.lien ? `<p><strong>Lien :</strong> <a href="${event.lien}">${event.lien}</a></p>` : ''}
      <p>Merci,</p>
    `
  };
}

function getParticipantResponseEmail(event, participantInfo, organisateurEmail) {
  if (!organisateurEmail) {
    throw new Error('Email de l\'organisateur manquant');
  }

  return {
    from: emailConfig.user,
    to: organisateurEmail,
    subject: `Réponse d'un participant à votre événement: ${event.titre}`,
    text: `Bonjour, un participant a répondu à votre événement "${event.titre}".\n\nNom du participant: ${participantInfo.nom}\nRéponse: ${participantInfo.reponse}\nMessage: ${participantInfo.message || 'Aucun message'}\n\nCordialement,`,
    html: `
      <p>Bonjour,</p>
      <p>Un participant a répondu à votre événement <strong>"${event.titre}"</strong>.</p>
      <p><strong>Nom du participant:</strong> ${participantInfo.nom}</p>
      <p><strong>Réponse:</strong> ${participantInfo.reponse}</p>
      <p><strong>Message:</strong> ${participantInfo.message || 'Aucun message'}</p>
      <p>Cordialement,</p>
    `
  };
}
function getEventReminderEmail(event, user, recipientEmail, timeInfoOverride = null) {
  let subject, timeInfo;

  if (['Réunion', 'Événement'].includes(event.type)) {
    timeInfo = timeInfoOverride || "dans deux heures";
    subject = `Rappel : ${event.type} "${event.titre}" dans deux heures`;
  } else if (event.type === 'Deadline') {
    timeInfo = "demain (fin prévue)";
    subject = `Rappel : Deadline "${event.titre}" se termine demain`;
  } else if (event.type === 'Holiday') {
    timeInfo = "demain (début prévu)";
    subject = `Rappel : Congé "${event.titre}" commence demain`;
  }
  
  return {
    from: emailConfig.user,
    to: recipientEmail,
    subject,
    text: `Bonjour ${user.nom || 'invité'},\n\nCeci est un rappel que l'événement "${event.titre}" (${event.type}) aura lieu ${timeInfo}, soit à ${new Date(event.date_debut).toLocaleString()}.\n\nLieu : ${event.emplacement}${event.lien ? `\nLien : ${event.lien}` : ''}\n\nMerci.`,
    html: `
      <p>Bonjour <strong>${user.nom || 'invité'}</strong>,</p>
      <p>Ceci est un rappel que l'événement <strong>"${event.titre}"</strong> (${event.type}) aura lieu ${timeInfo}, soit à <strong>${new Date(event.date_debut).toLocaleString()}</strong>.</p>
      <p><strong>Lieu :</strong> ${event.emplacement}</p>
      ${event.lien ? `<p><strong>Lien :</strong> <a href="${event.lien}">${event.lien}</a></p>` : ''}
      <p>Merci,</p>
    `
  };
}


const sendEmail = async (to, emailContent) => {
  try {
    if (!emailContent.to) {
      throw new Error('Destinataire manquant');
    }
    
    const info = await transporter.sendMail(emailContent);
    console.log('📨 Email envoyé:', info.response);
    return info;
  } catch (error) {
    console.error('❌ Erreur en envoyant l\'email:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  getEventCreationEmail,
  getEventReminderEmail,
  getParticipantResponseEmail
};