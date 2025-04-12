const express = require('express');
const router = express.Router();
const isAuth = require('../Middleware/isauth');
const {
  getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventsByOrganisateur,
    getEventsByParticipant,getEventsByUser,deleteHolidayAndDeadlineEvents
} = require('../Controllers/eventController');

// Routes protégées nécessitant une authentification
router.use(isAuth);

// Routes pour la gestion des événements
router.post('/create', createEvent);
router.get('/list', getEvents);
router.put('/update/:id', updateEvent);
router.delete('/delete/:id', deleteEvent);
router.get('/', getEventsByUser);

router.delete('/cleanup', deleteHolidayAndDeadlineEvents);

module.exports = router;