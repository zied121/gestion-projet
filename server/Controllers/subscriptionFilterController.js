const Subscription = require('../models/Subscription');
const Organisation = require('../models/OrganisationModel');
const Functionality = require('../models/Functionality');
const SubscriptionUsage = require('../models/SubscriptionUsage');

// Filter subscriptions by various criteria
const filterSubscriptions = async (req, res) => {
    try {
        const {
            type,
            status,
            dateRange,
            minUserLimit,
            maxUserLimit,
            minProjectLimit,
            maxProjectLimit,
            hasFunctionality,
            sortBy,
            sortOrder,
            page = 1,
            limit = 10
        } = req.query;

        const query = {};
        
        // Build filter query
        if (type) query.type = type;
        if (status) query.status = status;
        
        // Date range filter
        if (dateRange) {
            const [startDate, endDate] = dateRange.split(',');
            if (startDate && endDate) {
                query.startDate = { $gte: new Date(startDate) };
                query.endDate = { $lte: new Date(endDate) };
            }
        }
        
        // User and project limits for custom plans
        if (minUserLimit) query.userLimit = { $gte: parseInt(minUserLimit) };
        if (maxUserLimit) {
            query.userLimit = query.userLimit || {};
            query.userLimit.$lte = parseInt(maxUserLimit);
        }
        
        if (minProjectLimit) query.projectLimit = { $gte: parseInt(minProjectLimit) };
        if (maxProjectLimit) {
            query.projectLimit = query.projectLimit || {};
            query.projectLimit.$lte = parseInt(maxProjectLimit);
        }
        
        // Prepare aggregate pipeline
        const pipeline = [
            { $match: query }
        ];
        
        // Add functionality filter if specified
        if (hasFunctionality) {
            const functionality = await Functionality.findOne({ name: hasFunctionality });
            if (functionality) {
                pipeline.push({
                    $match: {
                        $or: [
                            // For custom plans, check customFunctionalities
                            { 
                                type: 'custom',
                                customFunctionalities: functionality._id 
                            },
                            // For standard plans, check if plan includes this functionality
                            {
                                type: { $in: functionality.plans }
                            }
                        ]
                    }
                });
            }
        }
        
        // Sorting
        const sortField = sortBy || 'createdAt';
        const sortDirection = sortOrder === 'asc' ? 1 : -1;
        pipeline.push({ $sort: { [sortField]: sortDirection } });
        
        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: parseInt(limit) });
        
        // Lookup organization details
        pipeline.push({
            $lookup: {
                from: 'organisations',
                localField: 'organisation',
                foreignField: '_id',
                as: 'organisationDetails'
            }
        });
        
        pipeline.push({
            $unwind: {
                path: '$organisationDetails',
                preserveNullAndEmptyArrays: true
            }
        });
        
        // Get subscription data
        const subscriptions = await Subscription.aggregate(pipeline);
        
        // Count total for pagination
        const totalCount = await Subscription.countDocuments(query);
        
        res.status(200).json({
            subscriptions,
            pagination: {
                total: totalCount,
                page: parseInt(page),
                pages: Math.ceil(totalCount / parseInt(limit)),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error filtering subscriptions:', error);
        res.status(500).json({ message: 'Error filtering subscriptions', error: error.message });
    }
};

// Search for subscriptions by organization name or other attributes
const searchSubscriptions = async (req, res) => {
    try {
        const { query, page = 1, limit = 10 } = req.query;
        
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }
        
        // First, search for organizations matching the query
        const organizations = await Organisation.find({
            $or: [
                { nom: { $regex: query, $options: 'i' } },
                { matricule_fiscal: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        }).select('_id');
        
        const organizationIds = organizations.map(org => org._id);
        
        // Find subscriptions associated with these organizations or matching subscription attributes
        const subscriptionQuery = {
            $or: [
                { organisation: { $in: organizationIds } },
                { type: { $regex: query, $options: 'i' } },
                { status: { $regex: query, $options: 'i' } }
            ]
        };
        
        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Execute query with pagination
        const subscriptions = await Subscription.find(subscriptionQuery)
            .populate('organisation', 'nom matricule_fiscal image')
            .populate('customFunctionalities', 'name description')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        // Count total for pagination
        const totalCount = await Subscription.countDocuments(subscriptionQuery);
        
        res.status(200).json({
            subscriptions,
            pagination: {
                total: totalCount,
                page: parseInt(page),
                pages: Math.ceil(totalCount / parseInt(limit)),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error searching subscriptions:', error);
        res.status(500).json({ message: 'Error searching subscriptions', error: error.message });
    }
};

// Get subscription dashboard with aggregated statistics
const getSubscriptionDashboard = async (req, res) => {
    try {
        // Aggregate subscription stats
        const stats = await Subscription.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    activeCount: { 
                        $sum: { 
                            $cond: [{ $eq: ['$status', 'active'] }, 1, 0] 
                        } 
                    }
                }
            }
        ]);
        
        // Get total subscription counts
        const totalSubscriptions = await Subscription.countDocuments();
        const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
        
        // Get recent subscriptions
        const recentSubscriptions = await Subscription.find()
            .populate('organisation', 'nom image')
            .sort({ createdAt: -1 })
            .limit(5);
        
        // Get expiring subscriptions (within next 7 days)
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        
        const expiringSubscriptions = await Subscription.find({
            status: 'active',
            endDate: { 
                $exists: true, 
                $ne: null,
                $lte: sevenDaysFromNow,
                $gte: new Date()
            }
        })
        .populate('organisation', 'nom image')
        .sort({ endDate: 1 })
        .limit(5);
        
        // Calculate subscription growth (month over month)
        const currentDate = new Date();
        const lastMonth = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
        const twoMonthsAgo = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
        
        const lastMonthSubscriptions = await Subscription.countDocuments({
            createdAt: { $gte: lastMonth, $lt: new Date() }
        });
        
        const previousMonthSubscriptions = await Subscription.countDocuments({
            createdAt: { $gte: twoMonthsAgo, $lt: lastMonth }
        });
        
        const growthRate = previousMonthSubscriptions > 0 
            ? ((lastMonthSubscriptions - previousMonthSubscriptions) / previousMonthSubscriptions) * 100 
            : 100;
        
        res.status(200).json({
            summary: {
                totalSubscriptions,
                activeSubscriptions,
                inactiveSubscriptions: totalSubscriptions - activeSubscriptions,
                growthRate: Math.round(growthRate * 100) / 100 // Round to 2 decimal places
            },
            subscriptionsByType: stats,
            recentSubscriptions,
            expiringSubscriptions
        });
    } catch (error) {
        console.error('Error generating subscription dashboard:', error);
        res.status(500).json({ message: 'Error generating subscription dashboard', error: error.message });
    }
};

module.exports = {
    filterSubscriptions,
    searchSubscriptions,
    getSubscriptionDashboard
}; 