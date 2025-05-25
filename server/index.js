require('dotenv').config({ path: './config/.env' });
const express = require('express');
const connectDb = require('./config/ConnectDb');
const app = express();
const cors = require('cors');
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
const eventRoutes = require('./Routes/eventRoutes');
const participantRoutes = require('./Routes/participantRoutes');
const chatbotRoutes = require('./Routes/chatbot');
const holidayRoutes = require('./Routes/holidayRoutes');


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
app.use('/api/organisation', OrganisationRoutes);
app.use('/api', AuthRoutes);
app.use('/api/users', userRouter);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/subscription', SubscriptionRoutes);
app.use('/api', projectRoutes);
app.use('/api', taskRoutes);
app.use('/api', aiRoutes);
app.use('/api', notificationRoutes);
app.use('/api/events', eventRoutes);
    app.use('/api', participantRoutes);
    app.use('/api/holiday', holidayRoutes);
    app.use('/api', chatbotRoutes);

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








