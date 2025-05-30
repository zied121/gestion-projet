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
    calculateCustomPlanPreview,
    openCustomPlanPaymentGateway,
    verifyCustomPlanPayment,
    getAvailableFunctionalities,
    getSubscriptionWithFunctionalities,
    createSubscription
} = require('../Controllers/subscriptionController');

router.post('/payment/open',isAuth, openPaymentGateway);
router.post('/payment/verify/:paymentId',isAuth, verifyPayment);

router.post('/update/open', isAuth,openGatewayForUpdate);
router.post('/update/verify/:paymentId', isAuth,verifyPaymentAndUpdateSubscription);

router.post('/custom/preview', isAuth, calculateCustomPlanPreview);
router.post('/custom/payment/open', isAuth, openCustomPlanPaymentGateway);
router.post('/custom/payment/verify/:paymentId', isAuth, verifyCustomPlanPayment);

router.get('/functionalities', isAuth, getAvailableFunctionalities);
router.get('/details-with-functionalities/:organisationId', isAuth, getSubscriptionWithFunctionalities);

router.delete('/cancel/:id', cancelSubscription);
router.get('/details/:organisationId', isAuth,getSubscriptionDetails);

router.post('/', createSubscription);

module.exports = router;
