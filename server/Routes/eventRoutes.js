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
  updateParticipantResponse
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
    console.log('Incoming request body:', req.body);
    console.log('Authenticated user:', req.user);
    next();
  },
  upload.single('file'),
  (req, res, next) => {
    console.log('Uploaded file:', req.file);
    next();
  },
  sanitizeEventData, // Sanitize data BEFORE validation
  (req, res, next) => {
    console.log('Data after sanitization:', req.body);
    next();
  },
  validateEvent,
  (req, res, next) => {
    console.log('Validation passed for event creation.');
    next();
  },
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
router.delete('/events/:id/participants/:participantId', isAuth, deleteParticipant);
// Nouvelle route pour supprimer des participants

module.exports = router;