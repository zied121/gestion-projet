require('dotenv').config({ path: './config/.env' });
const express = require('express');
const connectDb = require('./config/ConnectDb');
const app = express();
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
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
const categorieRoutes = require('./Routes/categorieRoutes');
const multer = require("multer");
connectDb();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*'
    }
});
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

app.set('io', io);

app.use('/api/organisation',OrganisationRoutes);
app.use('/api',AuthRoutes);
app.use('/api/users',userRouter);

app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/blogs", blogRoutes);
app.use('/api/categories', categorieRoutes);

app.use('/api/subscription', SubscriptionRoutes);
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








