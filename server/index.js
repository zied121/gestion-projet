const express = require('express');
const connectDb = require('./config/ConnectDb');
const app = express();
const cors = require('cors');

const userRouter=require('./Routes/UserRoutes');
const AuthRoutes=require('./Routes/AuthRoutes');
const OrganisationRoutes=require('./Routes/OrganisationRoutes');
const feedbackRoutes = require('./Routes/feedbackRoutes');
const blogRoutes = require('./Routes/blogRoutes');
const SubscriptionRoutes = require('./Routes/subscriptionRoutes');
const SubscriptionAnalyticsRoutes = require('./Routes/subscriptionAnalyticsRoutes');
const SubscriptionFilterRoutes = require('./Routes/subscriptionFilterRoutes');
const SubscriptionRenewalRoutes = require('./Routes/subscriptionRenewalRoutes');

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

app.use('/api/subscription', SubscriptionRoutes);
app.use('/api/subscription-analytics', SubscriptionAnalyticsRoutes);
app.use('/api/subscription-filter', SubscriptionFilterRoutes);
app.use('/api/subscription-renewal', SubscriptionRenewalRoutes);










