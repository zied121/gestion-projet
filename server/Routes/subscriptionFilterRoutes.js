const express = require('express');
const isAuth = require("../Middleware/isauth");
const { adminOrganisationMiddleware } = require("../Middleware/adminorganisation");
const {
    filterSubscriptions,
    searchSubscriptions,
    getSubscriptionDashboard
} = require('../Controllers/subscriptionFilterController');

const router = express.Router();

router.get('/filter', isAuth, filterSubscriptions);
router.get('/search', isAuth, searchSubscriptions);
router.get('/dashboard', isAuth, adminOrganisationMiddleware, getSubscriptionDashboard);

module.exports = router; 