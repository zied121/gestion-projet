const express = require('express');
const router = express.Router();
const isAuth = require('../Middleware/isauth');
const { getNotifications, markNotificationAsRead } = require('../controllers/notificationController');

router.get('/notifications', isAuth, getNotifications);
router.patch('/notifications/:id', isAuth, markNotificationAsRead);

module.exports = router;
