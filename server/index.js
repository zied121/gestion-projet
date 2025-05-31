require('dotenv').config({ path: './config/.env' });
const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const projectRoutes = require('./Routes/ProjectRoutes');
const taskRoutes = require('./Routes/TaskRoutes');
const socketIo = require('socket.io');

const userRouter=require('./Routes/UserRoutes');
const AuthRoutes=require('./Routes/AuthRoutes');
const OrganisationRoutes=require('./Routes/OrganisationRoutes');
const feedbackRoutes = require('./Routes/feedbackRoutes');
const blogRoutes = require('./Routes/blogRoutes');
const SubscriptionRoutes = require('./Routes/subscriptionRoutes');
const roomRoutes = require('./Routes/RoomRoutes');
const messageRoutes = require('./Routes/MessageRoute');
const GoogleAuth = require('./Routes/GoogleAuthRoute')
const fs = require('fs');
const multer = require('multer');
///////////////
// === Configuration des dossiers d'upload ===
const createUploadDirs = () => {
    const uploadsDir = path.join(__dirname, 'uploads');
    const blogImagesDir = path.join(uploadsDir, 'blog-images');

    [uploadsDir, blogImagesDir].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Dossier créé : ${dir}`);
        }
    });

    return { uploadsDir, blogImagesDir };
};

const { uploadsDir, blogImagesDir } = createUploadDirs();

// === Configuration Multer globale ===
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, blogImagesDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Seules les images sont autorisées!'), false);
    }
};

app.multerUpload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(uploadsDir));

/////////////

// ✅ Configure CORS BEFORE routes
app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());

// Connect DB
const server = http.createServer(app);
const connectDb = require('./config/ConnectDb');
connectDb();

app.use(express.json());

// Socket.io config (as is)
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





app.use('/api/organisation',OrganisationRoutes);
app.use('/api',AuthRoutes);
app.use('/api/users',userRouter);
app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/blogs", blogRoutes);
app.use('/api/subscription', SubscriptionRoutes);
// Routes setup
app.use('/uploads', express.static(path.join(__dirname, 'Middleware', 'uploads')));
app.use('/api', AuthRoutes);
app.use('/api/users', userRouter);
app.use('/api/organisation', OrganisationRoutes);
app.use('/api', AuthRoutes);
app.use('/api/users', userRouter);
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
app.use('/api/rooms', roomRoutes);





const port = process.env.port || 5000;
server.listen(port, (error) => {
    (error) ? console.log('Server failed') : console.log(`Server running on port ${port}`);
});








