const express = require('express');
const router = express.Router();
const isAuth = require('../Middleware/isauth');
const upload = require('../Middleware/upload');
const validateEvent = require('../Middleware/eventValidation');
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByOrganisateur,
  getEventsByParticipant,deleteParticipant, 
  getEventsByUser, 
  deleteHolidayAndDeadlineEvents, 
  searchEvents, 
  searchByUser,
  addParticipants,
  updateParticipantResponse, 
  participant_status
} = require('../Controllers/eventController');

// Data sanitization middleware
const sanitizeEventData = (req, res, next) => {
    try {
        console.log('Before sanitization:', req.body);
        
        // Convert string booleans to actual booleans
        if (req.body.isRecurring !== undefined) {
            if (typeof req.body.isRecurring === 'string') {
                req.body.isRecurring = req.body.isRecurring.toLowerCase() === 'true';
            }
        }

        // Convert string numbers to actual numbers
        const numericFields = ['custom_recurrence_days', 'recurrence_count'];
        numericFields.forEach(field => {
            if (req.body[field] && typeof req.body[field] === 'string') {
                const num = parseInt(req.body[field]);
                if (!isNaN(num)) {
                    req.body[field] = num;
                }
            }
        });

        console.log('After sanitization:', req.body);
        next();
    } catch (error) {
        console.error('Error in sanitizeEventData:', error);
        res.status(400).json({
            success: false,
            message: 'Erreur lors de la validation des données'
        });
    }
};

// Routes protégées nécessitant une authentification
router.use(isAuth);

// Routes pour la gestion des événements
router.post(
  '/create',
  (req, res, next) => {
    console.log('--- Debugging Create Event Route ---');
    console.log('Incoming headers:', req.headers);
    console.log('Content-Type:', req.headers['content-type']);
    next();
  },
  upload.single('file'),
  (req, res, next) => {
    console.log('Uploaded file:', req.file);
    console.log('Request body:', req.body);
    next();
  },
  sanitizeEventData,
  validateEvent,
  createEvent
);

router.get('/get/:id', getEventById);
router.get('/list', getEvents);
router.put('/update/:id', sanitizeEventData, validateEvent, updateEvent);

router.delete('/delete/:id', deleteEvent);
router.get('/search_user', searchByUser);
router.get('/event_participant/', getEventsByParticipant);
router.get('/event_org/', getEventsByOrganisateur);
router.get('/search', searchEvents);
router.get('/', getEventsByUser);
router.delete('/cleanup', deleteHolidayAndDeadlineEvents);
router.put('/add_participant/:id', addParticipants);
router.put('/update_participant/:id', updateParticipantResponse);
// Dans vos routes
router.delete('/events/:id/participants/:participantId', isAuth, deleteParticipant);



router.get('/:eventId/participant-status', async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user.id;

    try {
        const status = await participant_status(eventId, userId);
        return res.json(status);
    } catch (error) {
        return res.status(500).json({ error: 'Erreur lors de la récupération du statut du participant' });
    }
});
// Nouvelle route pour supprimer des participants

module.exports = router;