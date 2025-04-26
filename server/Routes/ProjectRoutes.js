const express = require('express');
const router = express.Router();
const isAuth = require('../Middleware/isauth');
const {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
} = require('../controllers/projectController');

router.post('/projects', isAuth, createProject);
router.get('/projects', isAuth, getProjects);
router.get('/projects/:id', isAuth, getProjectById);
router.put('/projects/:id', isAuth, updateProject);
router.delete('/projects/:id', isAuth, deleteProject);

module.exports = router;
