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
const SubscriptionRoutes = require('./Routes/subscriptionRoutes');

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

const port = 5000;
server.listen(port, (error) => {
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
app.use('/api/subscription', SubscriptionRoutes);










