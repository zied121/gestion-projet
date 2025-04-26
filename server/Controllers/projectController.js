const User = require('../models/Usermodel');
const { Project, projectValidationSchema } = require('../models/ProjectModel');

const createProject = async (req, res) => {
    try {
        await projectValidationSchema.validate(req.body);
        const project = new Project({
            ...req.body,
            owner: req.user._id
        });
        const savedProject = await project.save();

        const io = req.app.get('io');
        io.emit('projectCreated', savedProject);

        res.status(201).json(savedProject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getProjects = async (req, res) => {
    try {
        const { limit = 10, skip = 0, sort = '-createdAt' } = req.query;

        const projects = await Project.find({
            $or: [
                { owner: req.user._id },
                { members: req.user._id }
            ]
        })
            .populate('owner members')
            .sort(sort)
            .skip(Number(skip))
            .limit(Number(limit));

        res.status(200).json(projects);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('owner members');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const isAuthorized =
            project.owner.equals(req.user._id) || project.members.includes(req.user._id);

        if (!isAuthorized) {
            return res.status(403).json({ message: 'Accès refusé à ce projet' });
        }

        res.status(200).json(project);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const updateProject = async (req, res) => {
    try {
        await projectValidationSchema.validate(req.body);
        const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        });

        const io = req.app.get('io');
        io.emit('projectUpdated', updatedProject);

        res.status(200).json(updatedProject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const deleteProject = async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);

        const io = req.app.get('io');
        io.emit('projectDeleted', { projectId: req.params.id });

        res.status(200).json({ message: 'Projet supprimé avec succès' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
};
