const express = require('express');
const router = express.Router();
const isAuth = require('../Middleware/isauth');

const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
} = require('../Controllers/taskController');

router.post('/tasks', isAuth, createTask);
router.get('/tasks', isAuth, getTasks);
router.get('/tasks/:id', isAuth, getTaskById);
router.put('/tasks/:id', isAuth, updateTask);
router.delete('/tasks/:id', isAuth, deleteTask);

module.exports = router;