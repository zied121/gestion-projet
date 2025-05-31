// Top of the file
require("dotenv").config({ path: "./config/.env" });
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// ✅ Configure CORS BEFORE routes
app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());

// Connect DB
const connectDb = require('./config/ConnectDb');
connectDb();

app.use(express.json());

// Routes imports (as is)
require("dotenv").config({
    path: "./config/.env"
});
const userRouter=require('./Routes/UserRoutes');
const AuthRoutes=require('./Routes/AuthRoutes');
const OrganisationRoutes=require('./Routes/OrganisationRoutes');
const feedbackRoutes = require('./Routes/feedbackRoutes');
const blogRoutes = require('./Routes/blogRoutes');
const SubscriptionRoutes = require('./Routes/subscriptionRoutes');
const roomRoutes = require('./Routes/RoomRoutes');
const messageRoutes = require('./Routes/MessageRoute');
const GoogleAuth = require('./Routes/GoogleAuthRoute')
const projectRoutes = require('./Routes/ProjectRoutes');
const taskRoutes = require('./Routes/TaskRoutes');
const aiRoutes = require('./Routes/aiRoutes');
const notificationRoutes = require("./Routes/NotificationRoutes");



// Socket.io config (as is)
const io = socketIo(server, { cors: { origin: '*' } });
app.set('io', io);
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('joinRoom', (roomId) => socket.join(roomId));
    socket.on('sendMessage', (message) => io.to(message.room).emit('receiveMessage', message));
    socket.on('leaveRoom', (roomId) => socket.leave(roomId));
    socket.on('disconnect', () => console.log('User disconnected'));
    socket.on('messagePinned', (updatedMessage) => {
  socket.to(updatedMessage.room).emit('messagePinned', updatedMessage);
});
});

// Routes setup
app.use('/uploads', express.static(path.join(__dirname, 'Middleware', 'uploads')));
app.use('/api', AuthRoutes);
app.use('/api/users', userRouter);
app.use('/api/organisation', OrganisationRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/subscription', SubscriptionRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/message', messageRoutes);
app.use('/api', require('./Routes/ProjectRoutes'));
app.use('/api', require('./Routes/TaskRoutes'));
app.use('/api', require('./Routes/aiRoutes'));
app.use('/api', require('./Routes/NotificationRoutes'));
app.use('/api/google', GoogleAuth);
app.use('/uploads', express.static(path.join(__dirname, 'Middleware', 'uploads')));
//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Start server
const port = 5000;
server.listen(port, (err) =>
    err ? console.error('Server failed') : console.log(`Server running on port ${port}`)
);