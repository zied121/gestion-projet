const express = require('express');
const router = express.Router();
const isAuth = require('../Middleware/isauth');
const {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,assignUsersToProject,getProjectUsers
} = require('../controllers/projectController');
router.post('/:id/assign-users', assignUsersToProject);
router.post('/projects', isAuth, createProject);
router.get('/projects', isAuth, getProjects);
router.get('/projects/:id', isAuth, getProjectById);
router.put('/projects/:id', isAuth, updateProject);
router.delete('/projects/:id', isAuth, deleteProject);
router.post('/projects/:id/assign-users', isAuth, assignUsersToProject);
router.get('/projects/:id/users', isAuth, getProjectUsers);

module.exports = router;
