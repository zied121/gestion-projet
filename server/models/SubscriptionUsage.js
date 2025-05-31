const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscriptionUsageSchema = new Schema({
  organisation: {
    type: Schema.Types.ObjectId,
    ref: 'Organisation',
    required: true
  },
  subscription: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  userActivity: {
    activeUsers: { type: Number, default: 0 },
    inactiveUsers: { type: Number, default: 0 },
    lastActiveAt: { type: Date }
  },
  projectUsage: {
    activeProjects: { type: Number, default: 0 },
    archivedProjects: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    tasksTotal: { type: Number, default: 0 }
  },
  featureUsage: [{
    featureName: String,
    usageCount: { type: Number, default: 0 },
    lastUsedAt: Date
  }],
  storageUsage: {
    totalStorageBytes: { type: Number, default: 0 },
    filesUploaded: { type: Number, default: 0 }
  },
  billingPeriod: {
    startDate: Date,
    endDate: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SubscriptionUsage', subscriptionUsageSchema); 