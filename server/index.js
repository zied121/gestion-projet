const express = require('express');
const connectDb = require('./config/ConnectDb');
const cors = require('cors');
const dotenv = require('dotenv');

const userRouter = require('./Routes/UserRoutes');
const authRoutes = require('./Routes/AuthRoutes');
const organisationRoutes = require('./Routes/OrganisationRoutes');
const projectRoutes = require('./Routes/ProjectRoutes');
const taskRoutes = require('./Routes/TaskRoutes');
const userRouter=require('./Routes/UserRoutes');
const AuthRoutes=require('./Routes/AuthRoutes');
const OrganisationRoutes=require('./Routes/OrganisationRoutes');
const feedbackRoutes = require('./Routes/feedbackRoutes');
const blogRoutes = require('./Routes/blogRoutes');

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
app.listen(port, (error) => {
    if (error) {
        console.log('Server failed to start');
    } else {
        console.log('Server is running on port ' + port);
    }
});