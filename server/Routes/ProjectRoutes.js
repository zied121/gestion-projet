const express = require('express');
const router = express.Router();
const isAuth = require('../Middleware/isauth');
const checkRole = require('../Middleware/checkRole');
const {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
} = require('../Controllers/projectController');

router.post('/projects', isAuth, checkRole(['manager', 'admin']), createProject);
router.put('/projects/:id', isAuth, checkRole(['manager', 'admin']), updateProject);
router.delete('/projects/:id', isAuth, checkRole(['manager', 'admin']), deleteProject);
router.get('/projects', isAuth, getProjects); // members/managers peuvent voir les projets
router.get('/projects/:id', isAuth, getProjectById);
module.exports = router;