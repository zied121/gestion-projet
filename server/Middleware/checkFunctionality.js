const User = require('../models/Usermodel');
const Organisation = require('../models/OrganisationModel');
const Subscription = require('../models/Subscription');
const Functionality = require('../models/Functionality');

const planLimits = {
    standard: {
        users: 5,
        projects: 2
    },
    premium: {
        users: 15,
        projects: 10
    },
    premium_plus: {
        users: 50,
        projects: 25
    }
};

const checkFunctionality = async (req, res, next) => {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user || !user.Organisation_id) {
            return res.status(403).json({ message: 'You must be part of an organization' });
        }

        const organisation = await Organisation.findById(user.Organisation_id).populate('subscription');
        if (!organisation) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        if (!organisation.subscription || organisation.subscription.status !== 'active') {
            return res.status(403).json({ message: 'Your organization does not have an active subscription' });
        }

        const subscription = organisation.subscription;
        req.subscription = subscription;
        
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error checking subscription functionality' });
    }
};

// Check if specific functionality is available for the subscription
const checkSpecificFunctionality = (functionalityName) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.user.id);
            if (!user || !user.Organisation_id) {
                return res.status(403).json({ message: 'You must be part of an organization' });
            }

            const organisation = await Organisation.findById(user.Organisation_id).populate({
                path: 'subscription',
                populate: {
                    path: 'customFunctionalities'
                }
            });

            if (!organisation) {
                return res.status(404).json({ message: 'Organization not found' });
            }

            if (!organisation.subscription || organisation.subscription.status !== 'active') {
                return res.status(403).json({ 
                    message: 'Your organization does not have an active subscription',
                    suggestion: 'Please activate a subscription to use this feature'
                });
            }

            const subscription = organisation.subscription;
            
            // Check if functionality is available for this subscription
            let functionalityAvailable = false;
            
            if (subscription.type === 'custom') {
                // For custom plans, check if the functionality is in customFunctionalities
                functionalityAvailable = subscription.customFunctionalities.some(
                    f => f.name === functionalityName
                );
            } else {
                // For standard plans, check if functionality is available for this plan type
                const functionality = await Functionality.findOne({
                    name: functionalityName,
                    plans: subscription.type
                });
                
                functionalityAvailable = !!functionality;
            }
            
            if (!functionalityAvailable) {
                return res.status(403).json({ 
                    message: `The ${functionalityName} functionality is not available in your current plan`,
                    suggestion: 'Please upgrade your subscription to access this feature'
                });
            }
            
            next();
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error checking functionality access' });
        }
    };
};

// Check if the organization can add more users
const checkUserLimit = async (req, res, next) => {
    try {
        const organisation = await Organisation.findById(req.body.organisationId || req.params.organisationId).populate('subscription');
        
        if (!organisation) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        if (!organisation.subscription || organisation.subscription.status !== 'active') {
            return res.status(403).json({ message: 'Your organization does not have an active subscription' });
        }

        const subscription = organisation.subscription;
        const currentUsers = organisation.membres.length + 1; // +1 for admin
        
        // Check user limit based on subscription type
        let userLimit;
        
        if (subscription.type === 'custom') {
            userLimit = subscription.userLimit;
        } else {
            userLimit = planLimits[subscription.type]?.users || 5; // Default to standard if not found
        }
        
        if (currentUsers >= userLimit) {
            return res.status(403).json({ 
                message: `User limit reached. Your current plan allows ${userLimit} users. Please upgrade your subscription.`,
                currentUsers,
                userLimit
            });
        }
        
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error checking user limit' });
    }
};

// Check if the organization can add more projects
const checkProjectLimit = async (req, res, next) => {
    try {
        const organisation = await Organisation.findById(req.body.organisationId || req.params.organisationId).populate('subscription');
        
        if (!organisation) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        if (!organisation.subscription || organisation.subscription.status !== 'active') {
            return res.status(403).json({ message: 'Your organization does not have an active subscription' });
        }

        const subscription = organisation.subscription;
        const currentProjects = organisation.projets.length;
        
        // Check project limit based on subscription type
        let projectLimit;
        
        if (subscription.type === 'custom') {
            projectLimit = subscription.projectLimit;
        } else {
            projectLimit = planLimits[subscription.type]?.projects || 2; // Default to standard if not found
        }
        
        if (currentProjects >= projectLimit) {
            return res.status(403).json({ 
                message: `Project limit reached. Your current plan allows ${projectLimit} projects. Please upgrade your subscription.`,
                currentProjects,
                projectLimit
            });
        }
        
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error checking project limit' });
    }
};

module.exports = { 
    checkFunctionality, 
    checkUserLimit, 
    checkProjectLimit,
    checkSpecificFunctionality
};
