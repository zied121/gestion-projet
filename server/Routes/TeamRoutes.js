const express = require('express');
const router = express.Router();
const isAuth = require("../Middleware/isauth");
const {createTeam,getAllTeams,getTeamById,updateTeam,deleteTeam} = require('../Controllers/teamController');

router.post('/:Orgid',isAuth, createTeam);
router.get('/',isAuth, getAllTeams);
router.get('/:id',isAuth, getTeamById);
router.put('/:id', isAuth,updateTeam);
router.delete('/:id',isAuth, deleteTeam);

module.exports = router;