const express = require('express');
const isAuth = require("../Middleware/isauth");
const { validateOrganizationSubscription } = require('../Middleware/adminorganisation');
const {
    trackFeatureUsage,
    getUsageStatistics,
    updateStorageUsage,
    updateProjectStats
} = require('../Controllers/subscriptionAnalyticsController');

const router = express.Router();


router.post('/track-feature', isAuth, trackFeatureUsage);
router.get('/statistics/:organisationId', isAuth, validateOrganizationSubscription, getUsageStatistics);
router.post('/update-storage', isAuth, validateOrganizationSubscription, updateStorageUsage);
router.post('/update-project-stats', isAuth, validateOrganizationSubscription, updateProjectStats);

module.exports = router; 