  const nodemailer = require('nodemailer');
  const path = require('path');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


  const sendOrganiastionCodeEmail = async (email, password) => {

      try {
          transporter.sendMail({
              from: "ziedbensalah10@gmail.com",
              to: email,
              subject: "Workspace Invitation",
              html: `<p>You have been invited to the workspace. Here is your password: <strong>${password}</strong></p>`
          });
      } catch (err) {
          console.log(err);
      }

  };

  const ForgetPasswordEmail = async (email, password) => {

      try{
          transporter.sendMail({
              from:"ziedbensalah10@gmail.com",
              to: email,
              subject: "Password Reset",
              html: `here is your new password: <strong>${password}</strong>`
          });


      }catch (err){
          console.log(err);
      }
  }

const SendOtpMail = async (to, subject, otp) => {
    try {
        await transporter.sendMail({
            from: "ziedbensalah10@gmail.com",
            to: to,
            subject: subject,
            html: `<p>Your OTP code is: <strong>${otp}</strong></p>`
        });
    } catch (err) {
        console.log(err);
    }
}


const sendTaskCreatedNotification = async (managerEmail, managerName, taskTitle, projectName, priority, status) => {
    if (!managerEmail) {
        console.log('❗ Email manquant pour envoyer la notification.');
        return;
    }
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: managerEmail,
            subject: `Nouvelle tâche dans votre projet "${projectName}"`,
            html: `
                <p>Bonjour <strong>${managerName || 'Manager'}</strong>,</p>
                <p>Une nouvelle tâche a été créée dans votre projet <strong>${projectName}</strong>.</p>
                <ul>
                    <li><strong>Tâche :</strong> ${taskTitle}</li>
                    <li><strong>Priorité :</strong> ${priority}</li>
                    <li><strong>Statut :</strong> ${status}</li>
                </ul>
                <p>Cordialement,<br/>L'équipe Jira Clone</p>
            `
        });
    } catch (err) {
        console.log("sendTaskCreatedNotification error:", err);
    }
};

const SendOtpMail = async (to, subject, otp) => {
    try {
        await transporter.sendMail({
            from: "ziedbensalah10@gmail.com",
            to: to,
            subject: subject,
            html: `<p>Your OTP code is: <strong>${otp}</strong></p>`
        });
    } catch (err) {
        console.log(err);
    }
};


function getEventCreationEmail(event, user, recipientEmail) {
    const eventDate = new Date(event.date_debut);
    const eventEndDate = new Date(event.date_fin);

    const emailContent = {
        from: 'tasko.tasko2001@gmail.com',
        to: recipientEmail,
        subject: `Invitation à ${event.type} : ${event.titre}`,
        text: `Bonjour ${user.nom || 'invité'},\n\nVous êtes invité à ${event.type} "${event.titre}" qui aura lieu du ${eventDate.toLocaleString('fr-FR')} au ${eventEndDate.toLocaleString('fr-FR')}.\n\nLieu: ${event.emplacement}${event.lien ? `\nLien : ${event.lien}` : ''}${event.file && event.file !== 'none' ? '\n\nUn fichier est joint à cet événement.' : ''}\n\nMerci.`,
        html: `
            <p>Bonjour <strong>${user.nom || 'invité'}</strong>,</p>
            <p>Vous êtes invité à <strong>${event.type}</strong> : <em>${event.titre}</em>.</p>
            <p><strong>Date :</strong> du ${eventDate.toLocaleString('fr-FR')} au ${eventEndDate.toLocaleString('fr-FR')}</p>
            <p><strong>Lieu :</strong> ${event.emplacement}</p>
            ${event.lien ? `<p><strong>Lien :</strong> <a href="${event.lien}">${event.lien}</a></p>` : ''}
            ${event.file && event.file !== 'none' ? `<p><strong>Fichier :</strong> Un fichier est joint à cet email.</p>` : ''}
            <p>Merci,</p>
        `
    };

    // Ajouter la pièce jointe si elle existe
    if (event.file && event.file !== 'none') {
        const filePath = path.join(process.cwd(), 'uploads', path.basename(event.file));
        emailContent.attachments = [{
            filename: path.basename(event.file),
            path: filePath,
            contentType: 'application/octet-stream'
        }];
    }

    return emailContent;
}

function getParticipantResponseEmail(event, participantInfo, organisateurEmail) {
    if (!organisateurEmail) {
        throw new Error('Email de l\'organisateur manquant');
    }

    return {
        from: 'tasko.tasko2001@gmail.com',
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

function getReminderEmail(event, timeLeft, recipientEmail) {
    const eventDateDebut = new Date(event.date_debut);
    const eventDateFin = new Date(event.date_fin);

    const emailContent = {
        from: 'tasko.tasko2001@gmail.com',
        to: recipientEmail,
        subject: `Rappel: ${event.type} "${event.titre}" dans ${timeLeft}`,
        text: `Bonjour,\n\nCeci est un rappel pour votre ${event.type.toLowerCase()} "${event.titre}" prévu du ${eventDateDebut.toLocaleString()} au ${eventDateFin.toLocaleString()}.\n\nDescription: ${event.description}\nLieu: ${event.emplacement}${event.lien ? `\nLien: ${event.lien}` : ''}\n\nCordialement,\nVotre équipe,`,
        html: `
            <p>Bonjour,</p>
            <p>Ceci est un rappel pour votre ${event.type.toLowerCase()} <strong>"${event.titre}"</strong>.</p>
            <p><strong>Description :</strong> ${event.description}</p>
            <p><strong>Date début :</strong> ${eventDateDebut.toLocaleString()}</p>
            <p><strong>Date fin :</strong> ${eventDateFin.toLocaleString()}</p>
            <p><strong>Lieu :</strong> ${event.emplacement}</p>
            ${event.lien ? `<p><strong>Lien :</strong> <a href="${event.lien}">${event.lien}</a></p>` : ''}
            <p>Cordialement,</p>
        `
    };

    // Ajouter la pièce jointe si elle existe
    if (event.file && event.file !== 'none') {
        const filePath = path.join(process.cwd(), 'uploads', path.basename(event.file));
        emailContent.attachments = [{
            filename: path.basename(event.file),
            path: filePath,
            contentType: 'application/octet-stream'
        }];
    }

    return emailContent;
}

const sendEmail = async (to, emailContent) => {
    try {
        if (!emailContent.to) {
            throw new Error('Destinataire manquant');
        }

        const info = await transporter.sendMail(emailContent);
        console.log('📨 Email envoyé à:', emailContent.to);
        console.log('Sujet:', emailContent.subject);
        return info;
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de l\'email à', emailContent.to, ':', error);
        throw error;
    }
};
module.exports = {
    sendOrganiastionCodeEmail,
    ForgetPasswordEmail,
    SendOtpMail,
    ForgetPasswordEmail,
    sendTaskCreatedNotification
};

