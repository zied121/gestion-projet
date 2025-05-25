const mongoose = require('mongoose');
const yup = require('yup');

const commentSchema = new mongoose.Schema({
    content: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' },
    createdAt: { type: Date, default: Date.now }
});

const activityLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' },
    action: String,
    timestamp: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    status: { type: String, enum: ['To Do', 'In Progress', 'Done'], default: 'To Do' },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    organisation: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation' },
    assignee: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' },
    startDate: Date,
    dueDate: Date,
    labels: [String],
    subtasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    file: String,
    comments: [commentSchema],
    activityLogs: [activityLogSchema]
}, { timestamps: true });

const taskValidationSchema = yup.object({
    title: yup.string().required().min(3),
    description: yup.string(),
    status: yup.string().oneOf(['To Do', 'In Progress', 'Done']),
    priority: yup.string().oneOf(['Low', 'Medium', 'High', 'Urgent']),
    startDate: yup.date().nullable(),
    dueDate: yup.date().nullable(),
    labels: yup.array().of(yup.string()),
    project: yup.string().matches(/^[0-9a-fA-F]{24}$/),
    organisation: yup.string().matches(/^[0-9a-fA-F]{24}$/),
    assignee: yup.array().of(yup.string().matches(/^[0-9a-fA-F]{24}$/)),
    subtasks: yup.array().of(yup.string().matches(/^[0-9a-fA-F]{24}$/))
});

module.exports = {
    Task: mongoose.model('Task', taskSchema),
    taskValidationSchema
};
