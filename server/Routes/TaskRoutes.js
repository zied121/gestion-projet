const express = require('express');
const router = express.Router();
const upload = require('../Middleware/upload');
const isAuth = require('../Middleware/isauth');
const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    addSubtask,
    addCommentToTask,assignUsersToTask,getTasksByProject,updateTaskStatusOnly
} = require('../controllers/taskController');
const {Task} = require("../models/TaskModel");

router.post('/tasks', isAuth, upload.single('file'), createTask);
router.get('/tasks', isAuth, getTasks);
router.get('/tasks/:id', isAuth, getTaskById);
router.put('/tasks/:id', isAuth, updateTask);
router.delete('/tasks/:id', isAuth, deleteTask);
router.post('/tasks/:parentTaskId/subtasks', isAuth, addSubtask);
router.post('/tasks/:taskId/comments', isAuth, addCommentToTask);
router.post('/tasks/:taskId/assign-users', isAuth,assignUsersToTask );
router.get('/tasks/project/:projectId', isAuth, getTasksByProject);
router.patch('/tasks/:id/status', isAuth, updateTaskStatusOnly);


module.exports = router;