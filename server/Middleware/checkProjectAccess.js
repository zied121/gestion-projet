const Project = require('../models/ProjectModel');

const checkProjectAccess = async (req, res, next) => {
    const projectId = req.params.id || req.body.project;
    const userId = req.user._id;

    try {
        const project = await Project.findById(projectId);

        if (!project) return res.status(404).json({ message: 'Project not found' });

        const isOwner = project.owner.toString() === userId.toString();
        const isMember = project.members.some(memberId => memberId.toString() === userId.toString());

        if (!isOwner && !isMember) {
            return res.status(403).json({ message: 'Access denied to this project' });
        }

        next();
    } catch (err) {
        res.status(500).json({ message: 'Error verifying project access' });
    }
};

module.exports = checkProjectAccess;
