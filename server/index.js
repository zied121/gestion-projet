const express = require('express');
const connectDb = require('./config/ConnectDb');
const cors = require('cors');
const dotenv = require('dotenv');

const userRouter = require('./Routes/UserRoutes');
const authRoutes = require('./Routes/AuthRoutes');
const organisationRoutes = require('./Routes/OrganisationRoutes');
const projectRoutes = require('./Routes/ProjectRoutes');
const taskRoutes = require('./Routes/TaskRoutes');

dotenv.config({
    path: "./config/.env"
});

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

connectDb();

app.use('/api', organisationRoutes);
app.use('/api', authRoutes);
app.use('/api', userRouter);
app.use('/api', projectRoutes);
app.use('/api', taskRoutes);

app.listen(port, (error) => {
    if (error) {
        console.log('Server failed to start');
    } else {
        console.log('Server is running on port ' + port);
    }
});