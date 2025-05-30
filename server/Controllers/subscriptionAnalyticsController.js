const SubscriptionUsage = require('../models/SubscriptionUsage');
const Organisation = require('../models/OrganisationModel');
const Subscription = require('../models/Subscription');

// Initialize or update subscription usage tracking
const initializeUsageTracking = async (organisationId, subscriptionId) => {
    try {
        // Check if there's already a usage record for this billing period
        const currentDate = new Date();
        const subscription = await Subscription.findById(subscriptionId);
        
        if (!subscription) {
            throw new Error('Subscription not found');
        }
        
        // Create billing period dates (30 days from now or use subscription dates)
        const startDate = subscription.startDate || currentDate;
        const endDate = subscription.endDate || new Date(currentDate.setDate(currentDate.getDate() + 30));
        
        // Create or update usage record
        let usageRecord = await SubscriptionUsage.findOne({
            organisation: organisationId,
            subscription: subscriptionId,
            'billingPeriod.startDate': { $lte: currentDate },
            'billingPeriod.endDate': { $gte: currentDate }
        });
        
        if (!usageRecord) {
            usageRecord = new SubscriptionUsage({
                organisation: organisationId,
                subscription: subscriptionId,
                billingPeriod: {
                    startDate,
                    endDate
                }
            });
            await usageRecord.save();
        }
        
        return usageRecord;
    } catch (error) {
        console.error('Error initializing usage tracking:', error);
        throw error;
    }
};

// Update feature usage stats
const trackFeatureUsage = async (req, res) => {
    try {
        const { organisationId, featureName } = req.body;
        
        if (!organisationId || !featureName) {
            return res.status(400).json({ message: 'Organisation ID and feature name are required' });
        }
        
        const organisation = await Organisation.findById(organisationId);
        if (!organisation || !organisation.subscription) {
            return res.status(404).json({ message: 'Organisation or subscription not found' });
        }
        
        // Find or create usage record
        let usageRecord = await SubscriptionUsage.findOne({
            organisation: organisationId,
            subscription: organisation.subscription
        });
        
        if (!usageRecord) {
            usageRecord = await initializeUsageTracking(organisationId, organisation.subscription);
        }
        
        // Update feature usage
        const featureIndex = usageRecord.featureUsage.findIndex(f => f.featureName === featureName);
        
        if (featureIndex >= 0) {
            usageRecord.featureUsage[featureIndex].usageCount += 1;
            usageRecord.featureUsage[featureIndex].lastUsedAt = new Date();
        } else {
            usageRecord.featureUsage.push({
                featureName,
                usageCount: 1,
                lastUsedAt: new Date()
            });
        }
        
        await usageRecord.save();
        
        res.status(200).json({ message: 'Feature usage tracked successfully' });
    } catch (error) {
        console.error('Error tracking feature usage:', error);
        res.status(500).json({ message: 'Error tracking feature usage', error: error.message });
    }
};

// Get usage statistics for an organisation
const getUsageStatistics = async (req, res) => {
    try {
        const { organisationId } = req.params;
        
        if (!organisationId) {
            return res.status(400).json({ message: 'Organisation ID is required' });
        }
        
        const organisation = await Organisation.findById(organisationId).populate('subscription');
        if (!organisation) {
            return res.status(404).json({ message: 'Organisation not found' });
        }
        
        // Get usage records for this organisation
        const usageRecords = await SubscriptionUsage.find({
            organisation: organisationId
        }).sort({ 'billingPeriod.startDate': -1 }).limit(3); // Get last 3 billing periods
        
        if (!usageRecords || usageRecords.length === 0) {
            return res.status(404).json({ message: 'No usage data found for this organisation' });
        }
        
        // Current period usage
        const currentUsage = usageRecords[0];
        
        // Calculate usage percentages
        const subscription = organisation.subscription;
        let userLimitPercentage = 0;
        let projectLimitPercentage = 0;
        
        if (subscription) {
            const userLimit = subscription.type === 'custom' ? 
                subscription.userLimit : 
                (subscription.type === 'premium' ? 15 : (subscription.type === 'premium_plus' ? 50 : 5));
                
            const projectLimit = subscription.type === 'custom' ? 
                subscription.projectLimit : 
                (subscription.type === 'premium' ? 10 : (subscription.type === 'premium_plus' ? 25 : 2));
            
            userLimitPercentage = Math.round((currentUsage.userActivity.activeUsers / userLimit) * 100);
            projectLimitPercentage = Math.round((currentUsage.projectUsage.activeProjects / projectLimit) * 100);
        }
        
        // Format the response
        const formattedUsage = {
            currentPeriod: {
                startDate: currentUsage.billingPeriod.startDate,
                endDate: currentUsage.billingPeriod.endDate,
                userActivity: {
                    ...currentUsage.userActivity,
                    usagePercentage: userLimitPercentage
                },
                projectUsage: {
                    ...currentUsage.projectUsage,
                    usagePercentage: projectLimitPercentage,
                    taskCompletionRate: currentUsage.projectUsage.tasksTotal > 0 ?
                        Math.round((currentUsage.projectUsage.tasksCompleted / currentUsage.projectUsage.tasksTotal) * 100) : 0
                },
                popularFeatures: currentUsage.featureUsage
                    .sort((a, b) => b.usageCount - a.usageCount)
                    .slice(0, 5),
                storageUsage: {
                    ...currentUsage.storageUsage,
                    formattedStorage: formatBytes(currentUsage.storageUsage.totalStorageBytes)
                }
            },
            historicalData: usageRecords.slice(1).map(record => ({
                period: {
                    startDate: record.billingPeriod.startDate,
                    endDate: record.billingPeriod.endDate
                },
                activeUsers: record.userActivity.activeUsers,
                activeProjects: record.projectUsage.activeProjects,
                tasksCompleted: record.projectUsage.tasksCompleted
            }))
        };
        
        res.status(200).json(formattedUsage);
    } catch (error) {
        console.error('Error fetching usage statistics:', error);
        res.status(500).json({ message: 'Error fetching usage statistics', error: error.message });
    }
};

// Update storage usage
const updateStorageUsage = async (req, res) => {
    try {
        const { organisationId, bytesAdded, fileCount } = req.body;
        
        if (!organisationId) {
            return res.status(400).json({ message: 'Organisation ID is required' });
        }
        
        const organisation = await Organisation.findById(organisationId);
        if (!organisation || !organisation.subscription) {
            return res.status(404).json({ message: 'Organisation or subscription not found' });
        }
        
        // Find or create usage record
        let usageRecord = await SubscriptionUsage.findOne({
            organisation: organisationId,
            subscription: organisation.subscription
        });
        
        if (!usageRecord) {
            usageRecord = await initializeUsageTracking(organisationId, organisation.subscription);
        }
        
        // Update storage usage
        usageRecord.storageUsage.totalStorageBytes += (bytesAdded || 0);
        usageRecord.storageUsage.filesUploaded += (fileCount || 0);
        
        await usageRecord.save();
        
        res.status(200).json({ 
            message: 'Storage usage updated successfully',
            currentStorage: formatBytes(usageRecord.storageUsage.totalStorageBytes),
            totalFiles: usageRecord.storageUsage.filesUploaded
        });
    } catch (error) {
        console.error('Error updating storage usage:', error);
        res.status(500).json({ message: 'Error updating storage usage', error: error.message });
    }
};

// Update project and task statistics
const updateProjectStats = async (req, res) => {
    try {
        const { organisationId, activeProjects, archivedProjects, tasksCompleted, tasksTotal } = req.body;
        
        if (!organisationId) {
            return res.status(400).json({ message: 'Organisation ID is required' });
        }
        
        const organisation = await Organisation.findById(organisationId);
        if (!organisation || !organisation.subscription) {
            return res.status(404).json({ message: 'Organisation or subscription not found' });
        }
        
        // Find or create usage record
        let usageRecord = await SubscriptionUsage.findOne({
            organisation: organisationId,
            subscription: organisation.subscription
        });
        
        if (!usageRecord) {
            usageRecord = await initializeUsageTracking(organisationId, organisation.subscription);
        }
        
        // Update project usage stats
        if (activeProjects !== undefined) usageRecord.projectUsage.activeProjects = activeProjects;
        if (archivedProjects !== undefined) usageRecord.projectUsage.archivedProjects = archivedProjects;
        if (tasksCompleted !== undefined) usageRecord.projectUsage.tasksCompleted = tasksCompleted;
        if (tasksTotal !== undefined) usageRecord.projectUsage.tasksTotal = tasksTotal;
        
        await usageRecord.save();
        
        res.status(200).json({ 
            message: 'Project stats updated successfully',
            projectStats: usageRecord.projectUsage
        });
    } catch (error) {
        console.error('Error updating project stats:', error);
        res.status(500).json({ message: 'Error updating project stats', error: error.message });
    }
};

// Helper function to format bytes
const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

module.exports = {
    trackFeatureUsage,
    getUsageStatistics,
    updateStorageUsage,
    updateProjectStats,
    initializeUsageTracking
}; 