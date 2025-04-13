require("dotenv").config({path: "./config/.env"});
const express = require('express');
const connectDb = require('./config/ConnectDb');
const app = express();
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const userRouter=require('./Routes/UserRoutes');
const AuthRoutes=require('./Routes/AuthRoutes');
const OrganisationRoutes=require('./Routes/OrganisationRoutes');
const feedbackRoutes = require('./Routes/feedbackRoutes');
const blogRoutes = require('./Routes/blogRoutes');
const RoomRoutes = require('./Routes/RoomRoutes');
//const MessageRoutes = require('./Routes/MessageRoute')(io);
const MessageRoutes = require('./Routes/MessageRoute');

const GoogleAuth = require('./Routes/GoogleAuthRoute')
const { RoomSchema , validateRoomSchema }= require('./models/Room');
const validate = require('./Middleware/validate');
const isauth = require('./Middleware/isauth');



//app.use(express.json());
// Création du serveur HTTP
const server = http.createServer(app);
/*
// Création de l'instance Socket.IO
const io = socketIo(server, {
  cors: {
    origin: '*', // Autorise toutes les origines (tu peux restreindre ça à ton domaine Angular)
  }
});
app.set('io', io);

// Gérer les connexions socket
io.on('connection', (socket) => {
  console.log('Un utilisateur est connecté :', socket.id);
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`L'utilisateur ${socket.id} a rejoint la room ${roomId}`);
  });
  socket.on('sendMessage', (data) => {
    const { roomId, message } = data;
    io.to(roomId).emit('receiveMessage', message);
  });
  socket.onAny((event, ...args) => {
    console.log(`📡 Event: ${event}`, args);
  })
  socket.on('disconnect', () => {
    console.log('Un utilisateur s\'est déconnecté');
  });
});
*/


const port = process.env.port ||5000;
app.listen(port, (error) => {
    (error) ? console.log('server is failed'): console.log('server is running on port ' + port);
});
connectDb();
app.use(express.json());
app.use(cors());


app.use('/api/organisation',OrganisationRoutes);
app.use('/api',AuthRoutes);
app.use('/api/users',userRouter);
app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/rooms", RoomRoutes);
app.use("/api/message", MessageRoutes);
app.use('/google', GoogleAuth);


//module.exports = io;
