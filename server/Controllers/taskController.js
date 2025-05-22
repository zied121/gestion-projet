const { Task, taskValidationSchema } = require('../models/TaskModel');
const { Project } = require('../models/ProjectModel');
const { sendTaskCreatedNotification } = require('../config/nodemailer');
const Notification = require('../models/NotificationModel');

const createTask = async (req, res) => {
    try {
        await taskValidationSchema.validate(req.body);

        const task = new Task({
            ...req.body,
            file: req.file?.filename || null,
            createdBy: req.user._id,
            activityLogs: [{
                user: req.user._id,
                action: 'Tâche créée',
                timestamp: new Date()
            }]
        });

        const savedTask = await task.save();
        await Project.findByIdAndUpdate(task.project, {
            $push: { tasks: savedTask._id }
        });
        await Notification.create({
            user: req.body.assignee,
            content: `Une nouvelle tâche "${task.title}" vous a été assignée.`
        });
        const io = req.app.get('io');
        io.emit('taskCreated', savedTask);


        const project = await Project.findById(task.project).populate('owner');
        if (project.owner.email) {
            await sendTaskCreatedNotification(
                project.owner.email,
                project.owner.nom || 'Manager',
                task.title,
                project.name,
                task.priority,
                task.status
            );
        }

        res.status(201).json(savedTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getTasks = async (req, res) => {
    try {
        const { limit = 10, skip = 0, sort = '-createdAt' } = req.query;

        const tasks = await Task.find({
            $or: [
                { assignee: req.user._id },
                { createdBy: req.user._id }
            ]
        })
            .populate('project assignee')
            .sort(sort)
            .skip(Number(skip))
            .limit(Number(limit));

        res.status(200).json(tasks);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('project assignee');

        if (!task) {
            return res.status(404).json({ message: 'Tâche introuvable' });
        }

        const isAssignee = Array.isArray(task.assignee)
            ? task.assignee.some(assignee => assignee.equals(req.user._id))
            : task.assignee && task.assignee.equals(req.user._id);
        const isCreator = task.createdBy && task.createdBy.equals(req.user._id);

        if (!isAssignee && !isCreator) {
            return res.status(403).json({ message: 'Accès refusé à cette tâche' });
        }

        res.status(200).json(task);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const updateTask = async (req, res) => {
    try {
        await taskValidationSchema.validate(req.body);

        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });

        const io = req.app.get('io');
        io.emit('taskUpdated', updatedTask);

        res.status(200).json(updatedTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);

        const io = req.app.get('io');
        io.emit('taskDeleted', { taskId: req.params.id });

        res.status(200).json({ message: 'Task deleted' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const addSubtask = async (req, res) => {
    try {
        const { parentTaskId } = req.params;

        const subtask = new Task({
            ...req.body,
            createdBy: req.user._id
        });

        const savedSubtask = await subtask.save();

        await Task.findByIdAndUpdate(parentTaskId, {
            $push: { subtasks: savedSubtask._id }
        });

        const io = req.app.get('io');
        io.emit('subtaskAdded', { parentTaskId, subtask: savedSubtask });

        res.status(201).json(savedSubtask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const addCommentToTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const comment = {
            text: req.body.text,
            createdBy: req.user._id,
            createdAt: new Date()
        };

        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { $push: { comments: comment } },
            { new: true }
        ).populate('comments.createdBy');

        const io = req.app.get('io');
        io.emit('commentAdded', { taskId, comment });

        res.status(201).json(updatedTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
const assignUsersToTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { userIds } = req.body;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.assignee = userIds;
        await task.save();

        const io = req.app.get('io');
        io.emit('usersAssignedToTask', { taskId, userIds });

        res.status(200).json({ message: 'Users assigned successfully', task });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getTasksByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const tasks = await Task.find({ project: projectId })
            .populate('assignee', 'nom email')
            .populate('project', 'name');

        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la récupération des tâches', error: err.message });
    }
};
const updateTaskStatusOnly = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Statut requis' });
        }

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        res.status(200).json(task);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    addSubtask,
    addCommentToTask,assignUsersToTask,getTasksByProject,updateTaskStatusOnly
};
