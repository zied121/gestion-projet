require('dotenv').config({ path: './config/.env' });
const express = require('express');
const connectDb = require('./config/ConnectDb');
const app = express();
const cors = require('cors');
 const http = require('http');
const socketIo = require('socket.io');
const userRouter=require('./Routes/UserRoutes');
const AuthRoutes=require('./Routes/AuthRoutes');
const OrganisationRoutes=require('./Routes/OrganisationRoutes');
const http = require('http');
const { Server } = require('socket.io');

const projectRoutes = require('./Routes/ProjectRoutes');
const taskRoutes = require('./Routes/TaskRoutes');
const userRouter = require('./Routes/UserRoutes');
const AuthRoutes = require('./Routes/AuthRoutes');
const OrganisationRoutes = require('./Routes/OrganisationRoutes');
const feedbackRoutes = require('./Routes/feedbackRoutes');
const blogRoutes = require('./Routes/blogRoutes');
const aiRoutes = require('./Routes/aiRoutes');
const notificationRoutes = require("./Routes/NotificationRoutes");
const SubscriptionRoutes = require('./Routes/subscriptionRoutes');
const roomRoutes = require('./Routes/RoomRoutes');
const messageRoutes = require('./Routes/MessageRoute');
const GoogleAuth = require('./Routes/GoogleAuthRoute')
const path = require('path');
require("dotenv").config({
    path: "./config/.env"
});


//app.use(express.json());
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:4200' ,
    methods: ['GET', 'POST' , 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],

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
  /*  updated with service websocket
  socket.on('sendMessage', (data) => {
    const { roomId, message } = data;
    io.to(roomId).emit('receiveMessage', message);
  });*/
  socket.on('sendMessage', (message) => {
    const roomId = message.room;
    io.to(roomId).emit('receiveMessage', message);
  });
  socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId);
    console.log(`L'utilisateur ${socket.id} a quitté la room ${roomId}`);
  });

  socket.onAny((event, ...args) => {
    console.log(`📡 Event: ${event}`, args);
  })
  socket.on('disconnect', () => {
    console.log('Un utilisateur s\'est déconnecté');
  });
});

const port = 5000;
server.listen(port, (error) => {
    (error) ? console.log('server is failed'): console.log('server is running on port ' + port);

    
});

connectDb();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

app.set('io', io);

app.use('/api/organisation',OrganisationRoutes);
app.use('/api',AuthRoutes);
app.use('/api/users',userRouter);
app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/blogs", blogRoutes);
app.use('/api/subscription', SubscriptionRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/message', messageRoutes);
app.use('/google', GoogleAuth);
app.use('/uploads', express.static(path.join(__dirname, 'Middleware', 'uploads')));
app.use('/api/organisation', OrganisationRoutes);
app.use('/api', AuthRoutes);
app.use('/api/users', userRouter);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api', projectRoutes);
app.use('/api', taskRoutes);
app.use('/api', aiRoutes);
app.use('/api', notificationRoutes);

io.on('connection', (socket) => {
    console.log(`User connecté : ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`User déconnecté : ${socket.id}`);
    });
});

const port = process.env.port || 5000;
server.listen(port, (error) => {
    (error) ? console.log('Server failed') : console.log(`Server running on port ${port}`);
});








