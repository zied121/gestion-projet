const io = require('socket.io-client');

// Connexion au serveur WebSocket
const socket = io('http://localhost:5000');

// Lors de la connexion
socket.on('connect', () => {
  console.log('✅ Connecté au serveur WebSocket');

  // Optionnel : Joindre une room
  const roomId = '67f6ebc6954289e32a2d7434'; // Remplace par un ID de room valide
  socket.emit('joinRoom', roomId);

  // Envoyer un message
  socket.emit('sendMessage', { roomId, message: 'Bonjour depuis le client!' });
});

// Lors de la réception d'un message
socket.on('receiveMessage', (message) => {
  console.log('📩 Message reçu:', message);
});

// Lors de la déconnexion
socket.on('disconnect', () => {
  console.log('❌ Déconnecté du serveur WebSocket');
});
