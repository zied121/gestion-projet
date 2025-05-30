const express = require('express');
const isAuth = require("../Middleware/isauth");
const { adminOrganisationMiddleware } = require("../Middleware/adminorganisation");
const {
    configureRenewalSettings,
    getRenewalSettings,
    processRenewals,
    sendRenewalReminders,
    toggleAutoRenewal
} = require('../Controllers/subscriptionRenewalController');

const router = express.Router();

// Subscription renewal endpoints
router.post('/settings', isAuth, configureRenewalSettings);
router.get('/settings/:subscriptionId', isAuth, getRenewalSettings);
router.post('/toggle-auto-renewal/:subscriptionId', isAuth, toggleAutoRenewal);

// Admin-only endpoints for manual processing
router.post('/process-renewals', isAuth, adminOrganisationMiddleware, processRenewals);
router.post('/send-reminders', isAuth, adminOrganisationMiddleware, sendRenewalReminders);

module.exports = router; 