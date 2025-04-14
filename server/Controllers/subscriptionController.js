const Subscription = require('../models/Subscription');
const Organisation = require('../models/OrganisationModel');
const axios = require('axios');

const planPrices = {
    premium: 10000,          // 100 TND (in millimes)
    premium_plus: 20000,     // 200 TND (in millimes, adjust as necessary)
};



// Open Payment Gateway
const openPaymentGateway = async (req, res) => {
    const { type } = req.body;
    const amount = planPrices[type];

    if (!amount) {
        return res.status(400).json({ message: 'Invalid subscription type or free plan selected' });
    }

    try {
        const payload = {
            app_token: process.env.FLOUCI_APP_TOKEN,
            app_secret: process.env.FLOUCI_APP_SECRET,
            accept_card: "true",
            amount: amount,
            session_timeout_secs: 4000,
            success_link: "http://localhost:4200/success",
            fail_link: "http://localhost:4200/cancel",
            developer_tracking_id: "15f12b0f-9c38-4864-a2a0-7c31e6ef2d84",
        };

        const response = await axios.post("https://developers.flouci.com/api/generate_payment", payload, {
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        });

        const data = response.data;
        console.log(data);
        res.status(200).json({
            message: 'Payment gateway opened successfully',
            url: data.result.link,
            payment_id: data.result.payment_id,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error opening payment gateway', error: error.message });
    }
};

// Verify Payment & Create Subscription
const verifyPayment = async (req, res) => {
    const { paymentId } = req.params;
    const { organisationId, type } = req.body;

    try {
        const url = `https://developers.flouci.com/api/verify_payment/${paymentId}`;
        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                apppublic: process.env.FLOUCI_APP_TOKEN,
                appsecret: process.env.FLOUCI_APP_SECRET,
            },
        });

        const paymentData = response.data;

        if (paymentData.result.status !== 'SUCCESS') {
            return res.status(400).json({ message: 'Payment verification failed', paymentData });
        }

        const organisation = await Organisation.findById(organisationId);
        if (!organisation) return res.status(404).json({ message: 'Organisation not found' });

        const subscription = await Subscription.create({
            organisation: organisationId,
            type,
            status: 'active',
            startDate: new Date(),
        });

        organisation.subscription = subscription._id;
        await organisation.save();

        res.status(201).json({
            message: 'Subscription created successfully after payment verification',
            subscription
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error verifying payment or creating subscription', error: error.message });
    }
};

// Open gateway for updating subscription
const openGatewayForUpdate = async (req, res) => {
    const { type } = req.body;
    const amount = planPrices[type];

    if (!amount) {
        return res.status(400).json({ message: 'Invalid subscription type or free plan selected' });
    }

    try {
        const payload = {
            app_token: process.env.FLOUCI_APP_TOKEN,
            app_secret: process.env.FLOUCI_APP_SECRET,
            accept_card: "true",
            amount: amount,
            session_timeout_secs: 4000,
            success_link: "http://localhost:4200/success",
            fail_link: "http://localhost:4200/cancel",
            developer_tracking_id: "subscription-update",
        };

        const response = await axios.post("https://developers.flouci.com/api/generate_payment", payload, {
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        });

        res.status(200).json({
            message: 'Payment gateway opened successfully for subscription update',
            url: response.data.result.link,
            payment_id: response.data.result.payment_id,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error opening payment gateway', error: error.message });
    }
};

// Verify payment and Update Subscription
const verifyPaymentAndUpdateSubscription = async (req, res) => {
    const { paymentId } = req.params;
    const { subscriptionId, type } = req.body;

    try {
        const url = `https://developers.flouci.com/api/verify_payment/${paymentId}`;
        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                apppublic: process.env.FLOUCI_APP_TOKEN,
               appsecret: process.env.FLOUCI_APP_SECRET,
            },
        });

        const paymentData = response.data;

        if (paymentData.result.status !== 'SUCCESS') {
            return res.status(400).json({ message: 'Payment verification failed', paymentData });
        }

        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) return res.status(404).json({ message: 'Subscription not found' });

        subscription.type = type;
        subscription.status = 'active';
        await subscription.save();

        res.json({
            message: 'Subscription updated successfully after payment verification',
            subscription
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error verifying payment or updating subscription', error: error.message });
    }
};

// Cancel Subscription (no payment required)
const cancelSubscription = async (req, res) => {
    const { id } = req.params;

    try {
        const subscription = await Subscription.findById(id);
        if (!subscription) return res.status(404).json({ message: 'Subscription not found' });

        subscription.status = 'inactive';
        subscription.type = 'standard';
        await subscription.save();

        res.json({ message: 'Subscription canceled and reverted to standard', subscription });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error cancelling subscription' });
    }
};

const getSubscriptionDetails = async (req, res) => {
    const { organisationId } = req.params;

    try {
        const organisation = await Organisation.findById(organisationId).populate('subscription');
        if (!organisation) return res.status(404).json({ message: 'Organisation not found' });

        res.json({ subscription: organisation.subscription });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching subscription details' });
    }
};

module.exports = {
    openPaymentGateway,
    verifyPayment,
    openGatewayForUpdate,
    verifyPaymentAndUpdateSubscription,
    cancelSubscription,
    getSubscriptionDetails,
};
