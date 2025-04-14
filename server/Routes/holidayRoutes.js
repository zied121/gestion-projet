const express = require('express');
const router = express.Router();
const isAuth = require('../Middleware/isauth');


const {
    addHoliday,
    getAllHolidays,
    updateHoliday,
    deleteHoliday
} = require('../Controllers/holidayController');

// Routes protégées nécessitant une authentification
router.use(isAuth);

// Routes publiques pour consulter les jours fériés
router.get('/', getAllHolidays);

router.post('/addHoliday', addHoliday);
router.put('/:id', isAuth, updateHoliday);
router.delete('/:id', isAuth, deleteHoliday);

module.exports = router;