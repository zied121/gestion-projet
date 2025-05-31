const Subscription = require('../models/Subscription');
const Organisation = require('../models/OrganisationModel');
const Functionality = require('../models/Functionality');
const axios = require('axios');

const planPrices = {
    premium: 10000,          // 100 TND (in millimes)
    premium_plus: 20000,     // 200 TND (in millimes, adjust as necessary)
};

// Pricing for custom plans
const customPlanPricing = {
    basePrice: 5000,         // 50 TND base price
    perUser: 1000,           // 10 TND per user
    perProject: 500,         // 5 TND per project
    functionalityPrices: {   // Additional functionality prices
        advanced_reporting: 3000,
        gantt_chart: 2000,
        kanban_board: 2000,
        time_tracking: 2500,
        resource_management: 3000,
        api_access: 5000
    }
};

// Calculate custom plan price
const calculateCustomPlanPrice = (userLimit, projectLimit, functionalities = []) => {
    let price = customPlanPricing.basePrice;
    
    // Add per-user cost
    if (userLimit > 5) { // First 5 users included in base price
        price += (userLimit - 5) * customPlanPricing.perUser;
    }
    
    // Add per-project cost
    if (projectLimit > 2) { // First 2 projects included in base price
        price += (projectLimit - 2) * customPlanPricing.perProject;
    }
    
    // Add functionality costs
    functionalities.forEach(functionality => {
        if (customPlanPricing.functionalityPrices[functionality]) {
            price += customPlanPricing.functionalityPrices[functionality];
        }
    });
    
    return price;
};

// Calculate and preview custom plan price
const calculateCustomPlanPreview = async (req, res) => {
    try {
        const { userLimit, projectLimit, functionalities = [] } = req.body;
        
        if (!userLimit || !projectLimit) {
            return res.status(400).json({ message: 'User limit and project limit are required' });
        }
        
        const price = calculateCustomPlanPrice(userLimit, projectLimit, functionalities);
        
        res.status(200).json({
            userLimit,
            projectLimit,
            functionalities,
            price,
            priceFormatted: `${(price / 1000).toFixed(2)} TND` // Convert to TND with 2 decimal places
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error calculating custom plan price', error: error.message });
    }
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

// Open payment gateway for custom plan
const openCustomPlanPaymentGateway = async (req, res) => {
    const { userLimit, projectLimit, functionalities = [] } = req.body;
    
    if (!userLimit || !projectLimit) {
        return res.status(400).json({ message: 'User limit and project limit are required' });
    }
    
    try {
        const amount = calculateCustomPlanPrice(userLimit, projectLimit, functionalities);
        
        const payload = {
            app_token: process.env.FLOUCI_APP_TOKEN,
            app_secret: process.env.FLOUCI_APP_SECRET,
            accept_card: "true",
            amount: amount,
            session_timeout_secs: 4000,
            success_link: "http://localhost:4200/success",
            fail_link: "http://localhost:4200/cancel",
            developer_tracking_id: "custom-plan-payment",
        };

        const response = await axios.post("https://developers.flouci.com/api/generate_payment", payload, {
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        });

        const data = response.data;
        
        res.status(200).json({
            message: 'Payment gateway opened successfully for custom plan',
            url: data.result.link,
            payment_id: data.result.payment_id,
            customPlanDetails: {
                userLimit,
                projectLimit,
                functionalities,
                price: amount,
                priceFormatted: `${(amount / 1000).toFixed(2)} TND`
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error opening payment gateway for custom plan', error: error.message });
    }
};

// Verify payment and create custom subscription
const verifyCustomPlanPayment = async (req, res) => {
    const { paymentId } = req.params;
    const { organisationId, userLimit, projectLimit, functionalities = [] } = req.body;

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

        // Get functionality IDs from names
        let functionalityIds = [];
        if (functionalities.length > 0) {
            const functionalityDocs = await Functionality.find({ name: { $in: functionalities } });
            functionalityIds = functionalityDocs.map(f => f._id);
        }

        const customPrice = calculateCustomPlanPrice(userLimit, projectLimit, functionalities);

        const subscription = await Subscription.create({
            organisation: organisationId,
            type: 'custom',
            status: 'active',
            userLimit,
            projectLimit,
            customFunctionalities: functionalityIds,
            customPrice,
            startDate: new Date(),
        });

        organisation.subscription = subscription._id;
        await organisation.save();

        res.status(201).json({
            message: 'Custom subscription created successfully after payment verification',
            subscription
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error verifying payment or creating custom subscription', error: error.message });
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

// Get all available functionalities for custom plans
const getAvailableFunctionalities = async (req, res) => {
    try {
        const functionalities = await Functionality.find();
        
        // Format the response to include pricing information
        const formattedFunctionalities = functionalities.map(functionality => {
            return {
                id: functionality._id,
                name: functionality.name,
                description: functionality.description,
                plans: functionality.plans,
                price: customPlanPricing.functionalityPrices[functionality.name] || 0,
                priceFormatted: `${((customPlanPricing.functionalityPrices[functionality.name] || 0) / 1000).toFixed(2)} TND`
            };
        });
        
        res.status(200).json(formattedFunctionalities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching functionalities', error: error.message });
    }
};

// Create initial functionalities if they don't exist
const createInitialFunctionalities = async () => {
    try {
        const count = await Functionality.countDocuments();
        
        // Only create if no functionalities exist
        if (count === 0) {
            const functionalitiesData = [
                {
                    name: 'advanced_reporting',
                    description: 'Advanced analytics and reporting tools',
                    plans: ['premium', 'premium_plus', 'custom']
                },
                {
                    name: 'gantt_chart',
                    description: 'Gantt chart for project timeline visualization',
                    plans: ['premium', 'premium_plus', 'custom']
                },
                {
                    name: 'kanban_board',
                    description: 'Kanban board for task management',
                    plans: ['premium', 'premium_plus', 'custom']
                },
                {
                    name: 'time_tracking',
                    description: 'Time tracking for tasks and projects',
                    plans: ['premium_plus', 'custom']
                },
                {
                    name: 'resource_management',
                    description: 'Resource allocation and management',
                    plans: ['premium_plus', 'custom']
                },
                {
                    name: 'api_access',
                    description: 'API access for integration with other tools',
                    plans: ['premium_plus', 'custom']
                }
            ];
            
            await Functionality.insertMany(functionalitiesData);
            console.log('Initial functionalities created');
        }
    } catch (error) {
        console.error('Error creating initial functionalities:', error);
    }
};

// Call this function when the server starts
createInitialFunctionalities();

// Get details of current subscription with available functionalities
const getSubscriptionWithFunctionalities = async (req, res) => {
    const { organisationId } = req.params;

    try {
        const organisation = await Organisation.findById(organisationId).populate({
            path: 'subscription',
            populate: {
                path: 'customFunctionalities',
                model: 'Functionality'
            }
        });
        
        if (!organisation) {
            return res.status(404).json({ message: 'Organisation not found' });
        }
        
        if (!organisation.subscription) {
            return res.status(404).json({ message: 'No subscription found for this organisation' });
        }
        
        // Get all available functionalities
        const allFunctionalities = await Functionality.find();
        
        // Format subscription details
        const subscription = organisation.subscription;
        let planLimits;
        
        if (subscription.type === 'custom') {
            planLimits = {
                users: subscription.userLimit,
                projects: subscription.projectLimit
            };
        } else {
            planLimits = {
                users: customPlanPricing[subscription.type]?.users || 5,
                projects: customPlanPricing[subscription.type]?.projects || 2,
            };
        }
        
        // Get active functionalities for this subscription
        let activeFunctionalities = [];
        
        if (subscription.type === 'custom' && subscription.customFunctionalities) {
            activeFunctionalities = subscription.customFunctionalities;
        } else {
            // For standard plans, get functionalities included in the plan
            activeFunctionalities = allFunctionalities.filter(f => 
                f.plans.includes(subscription.type)
            );
        }
        
        // Count current usage
        const currentUsers = organisation.membres.length + 1; // +1 for admin
        const currentProjects = organisation.projets.length;
        
        res.status(200).json({
            subscription: {
                id: subscription._id,
                type: subscription.type,
                status: subscription.status,
                startDate: subscription.startDate,
                endDate: subscription.endDate,
                customPrice: subscription.customPrice,
                priceFormatted: subscription.type === 'custom' ? 
                    `${(subscription.customPrice / 1000).toFixed(2)} TND` : 
                    `${(planPrices[subscription.type] / 1000).toFixed(2)} TND`
            },
            limits: {
                users: {
                    limit: planLimits.users,
                    current: currentUsers,
                    remaining: planLimits.users - currentUsers
                },
                projects: {
                    limit: planLimits.projects,
                    current: currentProjects,
                    remaining: planLimits.projects - currentProjects
                }
            },
            functionalities: {
                active: activeFunctionalities.map(f => ({
                    id: f._id,
                    name: f.name,
                    description: f.description
                })),
                available: allFunctionalities.map(f => ({
                    id: f._id,
                    name: f.name,
                    description: f.description,
                    included: f.plans.includes(subscription.type) || 
                        (subscription.type === 'custom' && 
                         subscription.customFunctionalities.some(cf => cf._id.toString() === f._id.toString())),
                    price: customPlanPricing.functionalityPrices[f.name] || 0,
                    priceFormatted: `${((customPlanPricing.functionalityPrices[f.name] || 0) / 1000).toFixed(2)} TND`
                }))
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching subscription details with functionalities' });
    }
};

const DEMO_ORG = {
    nom: 'Demo Organisation',
    matricule_fiscal: 'DEMO123456',
    type: 'demo',
    description: 'Static demo organisation for subscriptions',
    location: 'Demo City',
    // You may need to set a valid admin ObjectId if required, or handle it below
};

// Helper to get or create the demo organisation
async function getOrCreateDemoOrganisation() {
    let org = await Organisation.findOne({ matricule_fiscal: DEMO_ORG.matricule_fiscal });
    if (!org) {
        // Find any user to set as admin, or create a dummy user if needed
        let admin = await require('../models/Usermodel').findOne();
        if (!admin) {
            admin = await require('../models/Usermodel').create({
                nom: 'Demo',
                prenom: 'Admin',
                email: 'demo-admin@example.com',
                motDePasse: 'password',
                role: 'admin'
            });
        }
        org = await Organisation.create({ ...DEMO_ORG, admin: admin._id });
    }
    return org;
}

const createSubscription = async (req, res) => {
    try {
        let { organisationId, planType, isAnnual, userLimit, projectLimit } = req.body;
        if (!organisationId || organisationId === 'demo-org-id') {
            const demoOrg = await getOrCreateDemoOrganisation();
            organisationId = demoOrg._id;
        }
        if (!planType) {
            return res.status(400).json({ message: 'planType is required' });
        }
        const subscription = await Subscription.create({
            organisation: organisationId,
            type: planType,
            status: 'active',
            startDate: new Date(),
            userLimit: planType === 'premium_plus' ? userLimit : undefined,
            projectLimit: planType === 'premium_plus' ? projectLimit : undefined
        });
        res.status(201).json(subscription);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create subscription', error: error.message });
    }
};





const getAllSubscriptionsAdmin = async (req, res) => {
    try {
        const subscriptions = await Subscription.find()
            .populate('organisation', 'name membres projets')
            .lean();

        const result = subscriptions.map(sub => {
            const userCount = sub.organisation 
                ? sub.organisation.membres.length + 1 // +1 for admin
                : 0;
                
            const projectCount = sub.organisation?.projets.length || 0;
            
            // Calculate revenue
            let revenue = 0;
            if (sub.type === 'custom' && sub.customPrice) {
                revenue = sub.customPrice / 1000; // Convert millimes to TND
            } else if (planPrices[sub.type]) {
                revenue = planPrices[sub.type] / 1000; // Convert millimes to TND
            }

            return {
                ...sub,
                organizationName: sub.organisation?.name || 'N/A',
                organizationId: sub.organisation?._id || null,
                userCount,
                projectCount,
                totalRevenue: revenue,
                active: sub.status === 'active',
                currentPeriodEnd: sub.endDate || new Date(Date.now() + 30*24*60*60*1000) // Default 30 days
            };
        });

        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Add to exports



module.exports = {
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
    createSubscription,
    getAllSubscriptionsAdmin,

};
