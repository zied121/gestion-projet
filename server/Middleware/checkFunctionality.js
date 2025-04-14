const Organisation = require('../models/OrganisationModel');
const Functionality = require('../models/Functionality');

const checkFunctionality = (functionalityName) => {
  return async (req, res, next) => {
    const { organisationId } = req.params;

    const organisation = await Organisation.findById(organisationId).populate('subscription');
    if (!organisation || !organisation.subscription) {
      return res.status(403).json({ message: 'Subscription required.' });
    }

    const functionality = await Functionality.findOne({ 
      name: functionalityName,
      plans: organisation.subscription.type
    });

    if (!functionality) {
      return res.status(403).json({ message: 'Feature not available for your plan.' });
    }

    next();
  };
};

module.exports = checkFunctionality;
