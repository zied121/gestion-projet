const SubscriptionRenewal = require('../models/SubscriptionRenewal');
const Subscription = require('../models/Subscription');
const Organisation = require('../models/OrganisationModel');
const User = require('../models/Usermodel');
const axios = require('axios');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create or update subscription renewal settings
const configureRenewalSettings = async (req, res) => {
    try {
        const { subscriptionId, autoRenew, paymentMethod, reminderDays } = req.body;

        // Find subscription
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }
        
        // Check if renewal settings already exist
        let renewalSettings = await SubscriptionRenewal.findOne({ subscription: subscriptionId });
        
        if (renewalSettings) {
            // Update existing settings
            renewalSettings.autoRenew = autoRenew !== undefined ? autoRenew : renewalSettings.autoRenew;
            
            if (paymentMethod) {
                renewalSettings.paymentMethod = paymentMethod;
            }
            
            if (reminderDays) {
                renewalSettings.renewalReminders.reminderDays = reminderDays;
            }
            
            // Calculate next renewal date based on subscription end date
            if (subscription.endDate) {
                renewalSettings.nextRenewalDate = subscription.endDate;
            }
        } else {
            // Create new settings
            renewalSettings = new SubscriptionRenewal({
                subscription: subscriptionId,
                organisation: subscription.organisation,
                autoRenew: autoRenew !== undefined ? autoRenew : false,
                paymentMethod: paymentMethod || 'flouci',
                nextRenewalDate: subscription.endDate || null
            });
            
            if (reminderDays) {
                renewalSettings.renewalReminders.reminderDays = reminderDays;
            }
        }
        
        await renewalSettings.save();
        
        res.status(200).json({
            message: 'Subscription renewal settings updated successfully',
            renewalSettings
        });
    } catch (error) {
        console.error('Error configuring renewal settings:', error);
        res.status(500).json({ message: 'Error configuring renewal settings', error: error.message });
    }
};

// Get renewal settings for a subscription
const getRenewalSettings = async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        
        const renewalSettings = await SubscriptionRenewal.findOne({ subscription: subscriptionId });
        
        if (!renewalSettings) {
            return res.status(404).json({ message: 'Renewal settings not found for this subscription' });
        }
        
        res.status(200).json(renewalSettings);
    } catch (error) {
        console.error('Error fetching renewal settings:', error);
        res.status(500).json({ message: 'Error fetching renewal settings', error: error.message });
    }
};

// Process pending renewals (would be called by a cron job)
const processRenewals = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Find subscriptions that need renewal today
        const pendingRenewals = await SubscriptionRenewal.find({
            autoRenew: true,
            nextRenewalDate: { $gte: today, $lt: tomorrow }
        }).populate('subscription').populate('organisation');
        
        const results = {
            success: [],
            failed: []
        };
        
        for (const renewal of pendingRenewals) {
            try {
                // Get payment amount based on subscription type
                let amount = 0;
                
                if (renewal.subscription.type === 'custom') {
                    amount = renewal.subscription.customPrice;
                } else if (renewal.subscription.type === 'premium') {
                    amount = 10000; // 100 TND
                } else if (renewal.subscription.type === 'premium_plus') {
                    amount = 20000; // 200 TND
                }
                
                if (amount === 0) {
                    // Standard plans don't require payment
                    continue;
                }
                
                // Simulate payment process - in production, this would call your payment provider
                const paymentResult = await processPayment(renewal, amount);
                
                if (paymentResult.success) {
                    // Update subscription end date (add 1 month)
                    const subscription = renewal.subscription;
                    
                    const newEndDate = new Date(subscription.endDate || new Date());
                    newEndDate.setMonth(newEndDate.getMonth() + 1);
                    
                    subscription.endDate = newEndDate;
                    await subscription.save();
                    
                    // Update renewal history
                    renewal.renewalHistory.push({
                        date: new Date(),
                        status: 'success',
                        paymentId: paymentResult.paymentId,
                        amount
                    });
                    
                    // Update next renewal date
                    renewal.nextRenewalDate = newEndDate;
                    await renewal.save();
                    
                    // Send success notification
                    await sendRenewalNotification(renewal.organisation, 'success', {
                        subscription: renewal.subscription,
                        amount,
                        nextRenewalDate: newEndDate
                    });
                    
                    results.success.push({
                        organisationId: renewal.organisation._id,
                        subscriptionId: renewal.subscription._id,
                        paymentId: paymentResult.paymentId,
                        amount
                    });
                } else {
                    // Record failed attempt
                    renewal.renewalHistory.push({
                        date: new Date(),
                        status: 'failed',
                        amount,
                        errorMessage: paymentResult.error
                    });
                    await renewal.save();
                    
                    // Send failure notification
                    await sendRenewalNotification(renewal.organisation, 'failed', {
                        subscription: renewal.subscription,
                        amount,
                        error: paymentResult.error
                    });
                    
                    results.failed.push({
                        organisationId: renewal.organisation._id,
                        subscriptionId: renewal.subscription._id,
                        error: paymentResult.error
                    });
                }
            } catch (renewalError) {
                console.error(`Error processing renewal for subscription ${renewal.subscription._id}:`, renewalError);
                
                results.failed.push({
                    organisationId: renewal.organisation._id,
                    subscriptionId: renewal.subscription._id,
                    error: renewalError.message
                });
            }
        }
        
        res.status(200).json({
            message: `Processed ${pendingRenewals.length} subscription renewals`,
            results
        });
    } catch (error) {
        console.error('Error processing renewals:', error);
        res.status(500).json({ message: 'Error processing renewals', error: error.message });
    }
};

// Send renewal reminders for upcoming renewals (would be called by a cron job)
const sendRenewalReminders = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Find all active renewal settings with reminders enabled
        const renewalSettings = await SubscriptionRenewal.find({
            'renewalReminders.enabled': true,
            nextRenewalDate: { $gt: today }
        }).populate('subscription').populate('organisation');
        
        const remindersSent = [];
        
        for (const setting of renewalSettings) {
            // Check if we need to send a reminder based on days until renewal
            const daysUntilRenewal = Math.ceil(
                (setting.nextRenewalDate - today) / (1000 * 60 * 60 * 24)
            );
            
            if (setting.renewalReminders.reminderDays.includes(daysUntilRenewal)) {
                // Get admin user to send the email
                const organisation = setting.organisation;
                const admin = await User.findById(organisation.admin);
                
                if (admin && admin.email) {
                    // Send reminder email
                    await sendReminderEmail(admin.email, {
                        userName: `${admin.prenom} ${admin.nom}`,
                        organisationName: organisation.nom,
                        daysUntilRenewal,
                        renewalDate: setting.nextRenewalDate,
                        subscriptionType: setting.subscription.type,
                        autoRenew: setting.autoRenew
                    });
                    
                    // Update last notification date
                    setting.lastNotificationSent = new Date();
                    await setting.save();
                    
                    remindersSent.push({
                        organisationId: organisation._id,
                        organisationName: organisation.nom,
                        daysUntilRenewal,
                        adminEmail: admin.email
                    });
                }
            }
        }
        
        res.status(200).json({
            message: `Sent ${remindersSent.length} renewal reminders`,
            remindersSent
        });
    } catch (error) {
        console.error('Error sending renewal reminders:', error);
        res.status(500).json({ message: 'Error sending renewal reminders', error: error.message });
    }
};

// Toggle auto-renewal setting
const toggleAutoRenewal = async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const { autoRenew } = req.body;
        
        if (autoRenew === undefined) {
            return res.status(400).json({ message: 'autoRenew parameter is required' });
        }
        
        let renewalSettings = await SubscriptionRenewal.findOne({ subscription: subscriptionId });
        
        if (!renewalSettings) {
            // Create new settings if they don't exist
            const subscription = await Subscription.findById(subscriptionId);
            if (!subscription) {
                return res.status(404).json({ message: 'Subscription not found' });
            }
            
            renewalSettings = new SubscriptionRenewal({
                subscription: subscriptionId,
                organisation: subscription.organisation,
                autoRenew,
                nextRenewalDate: subscription.endDate || null
            });
        } else {
            // Update existing settings
            renewalSettings.autoRenew = autoRenew;
        }
        
        await renewalSettings.save();
        
        res.status(200).json({
            message: `Auto-renewal ${autoRenew ? 'enabled' : 'disabled'} successfully`,
            renewalSettings
        });
    } catch (error) {
        console.error('Error toggling auto-renewal:', error);
        res.status(500).json({ message: 'Error toggling auto-renewal', error: error.message });
    }
};

// Helper functions

// Process payment (mock function)
const processPayment = async (renewal, amount) => {
    try {
        // In a real implementation, this would call your payment gateway
        // For demonstration purposes, we'll simulate a payment
        
        // Simulate success with 90% probability
        const isSuccess = Math.random() > 0.1;
        
        if (isSuccess) {
            // Generate a mock payment ID
            const paymentId = `pay_${crypto.randomBytes(8).toString('hex')}`;
            
            return {
                success: true,
                paymentId
            };
        } else {
            return {
                success: false,
                error: 'Payment processing failed'
            };
        }
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Send renewal notification email
const sendRenewalNotification = async (organisation, status, data) => {
    try {
        // Get admin user email
        const admin = await User.findById(organisation.admin);
        
        if (!admin || !admin.email) {
            throw new Error('Admin user not found or has no email');
        }
        
        // Configure email data
        let subject = '';
        let message = '';
        
        if (status === 'success') {
            subject = 'Subscription Renewed Successfully';
            message = `
                <h2>Subscription Renewed Successfully</h2>
                <p>Dear ${admin.prenom || 'Admin'},</p>
                <p>Your subscription for ${organisation.nom} has been successfully renewed.</p>
                <p><strong>Subscription Type:</strong> ${data.subscription.type}</p>
                <p><strong>Amount:</strong> ${(data.amount / 1000).toFixed(2)} TND</p>
                <p><strong>Next Renewal Date:</strong> ${data.nextRenewalDate.toLocaleDateString()}</p>
                <p>Thank you for your continued trust in our services.</p>
            `;
        } else {
            subject = 'Subscription Renewal Failed';
            message = `
                <h2>Subscription Renewal Failed</h2>
                <p>Dear ${admin.prenom || 'Admin'},</p>
                <p>We were unable to automatically renew your subscription for ${organisation.nom}.</p>
                <p><strong>Subscription Type:</strong> ${data.subscription.type}</p>
                <p><strong>Amount:</strong> ${(data.amount / 1000).toFixed(2)} TND</p>
                <p><strong>Error:</strong> ${data.error}</p>
                <p>Please update your payment method or contact support for assistance.</p>
            `;
        }
        
        // Send email (this would use your actual email sending logic)
        // For demonstration purposes, we'll just log it
        console.log(`Sending ${status} notification to ${admin.email}: ${subject}`);
        
        // In a real implementation, this would use your nodemailer setup
        // For example:
        // await transporter.sendMail({ to: admin.email, subject, html: message });
        
        return true;
    } catch (error) {
        console.error('Error sending renewal notification:', error);
        return false;
    }
};

// Send reminder email
const sendReminderEmail = async (email, data) => {
    try {
        const subject = `Subscription Renewal Reminder - ${data.daysUntilRenewal} days left`;
        
        const message = `
            <h2>Subscription Renewal Reminder</h2>
            <p>Dear ${data.userName},</p>
            <p>This is a reminder that your subscription for ${data.organisationName} will ${data.autoRenew ? 'automatically renew' : 'expire'} in ${data.daysUntilRenewal} days on ${data.renewalDate.toLocaleDateString()}.</p>
            <p><strong>Subscription Type:</strong> ${data.subscriptionType}</p>
            ${!data.autoRenew ? '<p><strong>Action Required:</strong> Please renew your subscription to avoid service interruption.</p>' : '<p>No action is required as your subscription is set to auto-renew.</p>'}
            <p>If you have any questions, please contact our support team.</p>
        `;
        
        // Send email (this would use your actual email sending logic)
        // For demonstration purposes, we'll just log it
        console.log(`Sending reminder email to ${email}: ${subject}`);
        
        return true;
    } catch (error) {
        console.error('Error sending reminder email:', error);
        return false;
    }
};

module.exports = {
    configureRenewalSettings,
    getRenewalSettings,
    processRenewals,
    sendRenewalReminders,
    toggleAutoRenewal
}; 