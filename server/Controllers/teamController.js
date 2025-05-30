const { Team } = require('../models/Team'); // Make sure to export Team in models

const createTeam = async (req, res) => {
    try {
        const { name, code_hex } = req.body;
        const Organisation_id = req.params.Orgid;

        if (!name || !Organisation_id) {
            return res.status(400).json({ error: 'Team name and Organisation_id are required' });
        }

        const team = new Team({
            name,
            code_hex: code_hex,
            Organisation_id
        });

        await team.save();
        res.status(201).json(team);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const getAllTeams = async (req, res) => {
    try {
        const teams = await Team.find();
        res.json(teams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getTeamById = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) return res.status(404).json({ error: 'Team not found' });
        res.json(team);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateTeam = async (req, res) => {
    try {
        const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!team) return res.status(404).json({ error: 'Team not found' });
        res.json(team);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const deleteTeam = async (req, res) => {
    try {
        const team = await Team.findByIdAndDelete(req.params.id);
        if (!team) return res.status(404).json({ error: 'Team not found' });
        res.json({ message: 'Team deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


module.exports ={
    createTeam,
    getAllTeams,
    getTeamById,
    updateTeam,
    deleteTeam
}