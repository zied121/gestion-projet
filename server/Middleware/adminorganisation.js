const { User } = require('../models/Usermodel');
const {Organisation} = require('../models/OrganisationModel'); 

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

module.exports  = adminOrganisationMiddleware;