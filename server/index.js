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
const MessageRoutes = require('./Routes/MessageRoute');
const GoogleAuth = require('./Routes/GoogleAuthRoute')
const { Server } = require('socket.io');

require('dotenv').config();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // remplace * par l'URL de ton frontend si besoin
        methods: ["GET", "POST"]
    }
});

app.set('io', io); // <-- utile pour y accéder dans les contrôleurs

io.on('connection', (socket) => {
    console.log('✅ Nouvelle connexion Socket.IO', socket.id);

    // Rejoindre une room
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`🟢 ${socket.id} a rejoint la room : ${roomId}`);
    });

    // Quitter la room
    socket.on('leaveRoom', (roomId) => {
        socket.leave(roomId);
        console.log(`🔴 ${socket.id} a quitté la room : ${roomId}`);
    });
});

const messageRoutes = require('./routes/MessageRoute'); // exemple
app.use('/api/messages', messageRoutes);

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server listening on port ${port}`));

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
