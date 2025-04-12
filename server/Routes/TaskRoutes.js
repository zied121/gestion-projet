const express = require('express');
const router = express.Router();
const isAuth = require('../Middleware/isauth');
const checkRole = require('../Middleware/checkRole');
const checkProjectAccess = require('../Middleware/checkProjectAccess');
const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
} = require('../Controllers/taskController');

router.post('/tasks', isAuth, checkRole(['manager']), createTask);
router.put('/tasks/:id', isAuth, checkProjectAccess, updateTask);
router.delete('/tasks/:id', isAuth, checkRole(['manager']), deleteTask);
router.get('/tasks', isAuth, getTasks);
router.get('/tasks/:id', isAuth, getTaskById);
module.exports = router;