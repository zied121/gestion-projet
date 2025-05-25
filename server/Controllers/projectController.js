const User = require('../models/Usermodel');
const { Project, projectValidationSchema } = require('../models/ProjectModel');
const {Types} = require("mongoose");


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
            $or: [{ owner: req.user._id }, { members: req.user._id }]
        })
            .populate('owner members')
            .populate({
                path: 'tasks',
                populate: { path: 'activityLogs.user', select: 'nom email' } // si activityLogs a des ref
            })
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
        const project = await Project.findById(req.params.id)
            .populate('owner members')
            .populate({
                path: 'tasks',
                populate: { path: 'assignee', select: 'nom email' }
            });
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
    const { id } = req.params;
    const { name, description, status, start_date, end_date, members } = req.body;

    try {
        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: 'Projet non trouvé.' });
        }

        // Mise à jour des attributs du projet
        project.name = name;
        project.description = description;
        project.status = status;
        project.start_date = start_date;
        project.end_date = end_date;

        // Mise à jour des membres
        if (Array.isArray(members)) {
            project.members = members;
        }

        await project.save();

        res.status(200).json({ message: 'Projet mis à jour avec succès.', project });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour du projet.', error: err.message });
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
const assignUsersToProject = async (req, res) => {
    const { id } = req.params; // ID du projet
    const { userIds } = req.body; // Liste des IDs des utilisateurs à assigner

    // Vérification que `userIds` est un tableau valide contenant des ObjectId
    if (!Array.isArray(userIds) || !userIds.every(Types.ObjectId.isValid)) {
        return res.status(400).json({ message: 'Liste de membres invalide.' });
    }

    try {
        // Recherche du projet par ID
        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: 'Projet non trouvé.' });
        }

        // Mise à jour des membres du projet
        project.members = userIds;
        await project.save();

        // Récupération des membres mis à jour avec leurs informations
        const updated = await Project.findById(id).populate('members', 'nom email role');

        res.status(200).json({
            message: 'Utilisateurs assignés avec succès',
            members: updated.members
        });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};
const getProjectUsers = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findById(id).populate({
            path: 'members',
            model: 'Utilisateur' // Assurez-vous que ce modèle est correct
        });

        if (!project) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }

        res.status(200).json(project.members);
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

const getProjectsForMember = async (req, res) => {
    try {
        const userId = req.params.id; // Correction ici : utilisation de req.params.id

        if (!userId) {
            return res.status(400).json({ message: 'ID utilisateur manquant.' });
        }

        const projects = await Project.find({ members: userId })
            .populate('members', 'nom email')
            .populate('owner', 'nom email')
            .populate({
                    path: 'tasks',
                    populate: { path: 'activityLogs.user', select: 'nom email' }
                });

        if (!projects || projects.length === 0) {
            return res.status(404).json({ message: 'Aucun projet trouvé pour cet utilisateur.' });
        }

        res.status(200).json(projects);
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    assignUsersToProject,
    getProjectUsers,
    getProjectsForMember
};
