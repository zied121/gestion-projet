const emailService = require('./config/emailservice');

async function testEmail() {
  try {
    // Créer un événement de test
    const testEvent = {
      type: 'Réunion',
      titre: 'Test de rappel',
      date_debut: new Date(Date.now() + 1000 * 60 * 5), 
      date_fin: new Date(Date.now() + 1000 * 60 * 65), 
      emplacement: 'Salle de test',
      lien: 'https://meet.example.com/test'
    };

    // Créer un utilisateur de test
    const testUser = {
      "email":"chaymaa.sammoud@gmail.com",
  "motDePasse": "123456"
    };

    // Tester l'email de rappel
    const emailContent = emailService.getEventReminderEmail(
      testEvent,
      testUser,
      testUser.email,
      'dans quelques minutes'
    );

    console.log('Tentative d\'envoi d\'email...');
    const result = await emailService.sendEmail(testUser.email, emailContent);
    console.log('Email envoyé avec succès:', result);
  } catch (error) {
    console.error('Erreur lors du test d\'email:', error);
  }
}

testEmail();