const Notification = require('../models/NotificationModel');

const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const markNotificationAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        res.status(200).json(notification);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    getNotifications,
    markNotificationAsRead
};
