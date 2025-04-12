const Task = require('../models/TaskModel');

const createTask = async (req, res) => {
    try {
        const task = new Task(req.body);
        const savedTask = await task.save();
        res.status(201).json(savedTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({
            $or: [
                { assignee: req.user._id },
                { createdBy: req.user._id }
            ]
        }).populate('project assignee');

        res.status(200).json(tasks);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getTaskById = async (req, res) => {
    try {
        const tasks = await Task.find({
            $or: [
                { assignee: req.user._id },
                { createdBy: req.user._id }
            ]
        }).populate('project assignee');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json(task);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Task deleted' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
};