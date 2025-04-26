const mongoose = require('mongoose');
const yup = require('yup');

const activityLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' },
    action: String,
    timestamp: { type: Date, default: Date.now }
});
//
const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    startDate: Date,
    endDate: Date,
    status: {
        type: String,
        enum: ['Planned', 'Active', 'Completed', 'Archived'],
        default: 'Planned'
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' },
    activityLogs: [activityLogSchema]
}, { timestamps: true });

const projectValidationSchema = yup.object({
    name: yup.string().required().min(3),
    description: yup.string(),
    startDate: yup.date().nullable(),
    endDate: yup.date().nullable(),
    status: yup.string().oneOf(['Planned', 'Active', 'Completed', 'Archived']),
    members: yup.array().of(yup.string().matches(/^[0-9a-fA-F]{24}$/)),
    owner: yup.string().matches(/^[0-9a-fA-F]{24}$/)
});

module.exports = {
    Project: mongoose.model('Project', projectSchema),
    projectValidationSchema
};

