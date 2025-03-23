const adminOrganisationMiddleware = async (req, res, next) => {
    try {
        const user = req.user; // Assuming user is attached to req object
        const organisationId = req.params.organisationId; // Assuming organisationId is passed as a route parameter

        if (!user || !organisationId) {
            return res.status(400).json({ message: 'User or organisation ID not provided' });
        }

        // Assuming user.organisations is an array of organisations the user is admin of
        const isAdmin = user.organisations.some(org => org.id === organisationId && org.role === 'admin');

        if (!isAdmin) {
            return res.status(403).json({ message: 'User is not an admin of the organisation' });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports  = adminOrganisationMiddleware;