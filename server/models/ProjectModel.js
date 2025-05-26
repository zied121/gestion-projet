const mongoose = require('mongoose');
const yup = require('yup');

const activityLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' },
    action: String,
    timestamp: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    organisation: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation' },
    name: { type: String, required: true },
    description: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' }],
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    tags: [{ type: String }],
    status: {
        type: String,
        enum: ['Planned', 'Active', 'Completed', 'Archived'],
        default: 'Planned',
        required: true
    },
    activityLogs: [activityLogSchema]
}, { timestamps: true });


const projectValidationSchema = yup.object({
    name: yup.string().required().min(3),
    organisation: yup.string().required().matches(/^[0-9a-fA-F]{24}$/),
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

