    const express = require('express');
    const connectDb = require('./config/ConnectDb');
    const app = express();
    const cors = require('cors');

    const projectRoutes = require('./Routes/ProjectRoutes');
    const taskRoutes = require('./Routes/TaskRoutes');
    const userRouter=require('./Routes/UserRoutes');
    const AuthRoutes=require('./Routes/AuthRoutes');
    const OrganisationRoutes=require('./Routes/OrganisationRoutes');
    const feedbackRoutes = require('./Routes/feedbackRoutes');
    const blogRoutes = require('./Routes/blogRoutes');
    const eventRoutes = require('./Routes/eventRoutes');
    const participantRoutes = require('./Routes/participantRoutes');
    const holidayRoutes = require('./Routes/holidayRoutes');
    const chatbotRoutes = require('./Routes/chatbot');



    require("dotenv").config({
        path: "./config/.env"
    });

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
    app.use('/api', projectRoutes);
    app.use('/api', taskRoutes);
    app.use('/api/events', eventRoutes);
    app.use('/api', participantRoutes);
    app.use('/api/holiday', holidayRoutes);
    app.use('/api', chatbotRoutes);