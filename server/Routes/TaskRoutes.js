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
    addCommentToTask
} = require('../controllers/taskController');

router.post('/tasks', isAuth, upload.single('file'), createTask);
router.get('/tasks', isAuth, getTasks);
router.get('/tasks/:id', isAuth, getTaskById);
router.put('/tasks/:id', isAuth, updateTask);
router.delete('/tasks/:id', isAuth, deleteTask);
router.post('/tasks/:parentTaskId/subtasks', isAuth, addSubtask);
router.post('/tasks/:taskId/comments', isAuth, addCommentToTask);

module.exports = router;