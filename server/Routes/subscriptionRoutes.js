const express = require('express');
const isAuth = require("../Middleware/isauth");
const router = express.Router();
const {
    openPaymentGateway,
    verifyPayment,
    openGatewayForUpdate,
    verifyPaymentAndUpdateSubscription,
    cancelSubscription,
    getSubscriptionDetails,
} = require('../Controllers/subscriptionController');

router.post('/payment/open',isAuth, openPaymentGateway);
router.post('/payment/verify/:paymentId',isAuth, verifyPayment);

router.post('/update/open', isAuth,openGatewayForUpdate);
router.post('/update/verify/:paymentId', isAuth,verifyPaymentAndUpdateSubscription);

router.delete('/cancel/:id', cancelSubscription);
router.get('/details/:organisationId', isAuth,getSubscriptionDetails);


module.exports = router;
