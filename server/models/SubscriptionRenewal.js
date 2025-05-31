const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscriptionRenewalSchema = new Schema({
    subscription: {
        type: Schema.Types.ObjectId,
        ref: 'Subscription',
        required: true
    },
    organisation: {
        type: Schema.Types.ObjectId,
        ref: 'Organisation',
        required: true
    },
    autoRenew: {
        type: Boolean,
        default: false
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'bank_transfer', 'flouci'],
        default: 'flouci'
    },
    renewalReminders: {
        enabled: {
            type: Boolean,
            default: true
        },
        reminderDays: {
            type: [Number],
            default: [30, 15, 7, 3, 1]
        }
    },
    renewalHistory: [{
        date: Date,
        status: {
            type: String,
            enum: ['success', 'failed', 'pending'],
        },
        paymentId: String,
        amount: Number,
        errorMessage: String
    }],
    lastNotificationSent: Date,
    nextRenewalDate: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('SubscriptionRenewal', subscriptionRenewalSchema); 