const nodemailer = require('nodemailer');

// Transporteur configuré avec ton adresse et le mot de passe d'application
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tasko.tasko2001@gmail.com', // remplace par ton adresse Gmail
    pass: 'oilc qrdz qhqd hbgr', // mets le mot de passe d'application sans espace
  },
});

// Options du mail
const mailOptions = {
  from: 'tasko.tasko2001@gmail.com', // ton adresse Gmail
  to: 'chaymaa.sammoud@gmail.com',
  subject: 'Test depuis Node.js',
  text: 'Bonjour Chaymaa,\nCeci est un test d’envoi d’email depuis Node.js avec Gmail.',
};

// Envoi de l'email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.log('❌ Erreur :', error);
  }
  console.log('✅ Email envoyé :', info.response);
});
