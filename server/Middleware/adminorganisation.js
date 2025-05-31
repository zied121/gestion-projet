const User = require('../models/Usermodel');
const Organisation = require('../models/OrganisationModel'); 

const adminOrganisationMiddleware = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const organisationId = req.params.organisationId; 

        if (!user || !organisationId) {
            return res.status(400).json({ message: 'User or organisation ID not provided' });
        }
        // Assuming user.Organisation_id is a single organisation ID the user is admin of
        const isAdmin = user.Organisation_id && user.Organisation_id.toString() === organisationId;
      

        if (!isAdmin) {
            return res.status(403).json({ message: 'User is not an admin of the organisation' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Check subscription status and validate organization
const validateOrganizationSubscription = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'Organisation_id',
            populate: {
                path: 'subscription'
            }
        });

        if (!user.Organisation_id) {
            return res.status(403).json({
                msg: "You are not part of an organization"
            });
        }

        const organization = user.Organisation_id;
        
        // Check if organization has an active subscription
        if (!organization.subscription || organization.subscription.status !== 'active') {
            return res.status(403).json({
                msg: "Your organization does not have an active subscription",
                suggestion: "Please activate a subscription plan to access this feature"
            });
        }
        
        // Store subscription info in request for potential use in controllers
        req.subscription = organization.subscription;
        req.organization = organization;
        
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({
            msg: "Failed to validate organization subscription"
        });
    }
};

module.exports = { adminOrganisationMiddleware, validateOrganizationSubscription };