const express = require('express');
const router = express.Router();
const isAuth = require('../Middleware/isauth');
const {
  addParticipants,updateReponse
} = require('../Controllers/participantController'); 

router.use(isAuth);

// Route pour ajouter des participants à un événement
router.post('/participant/:event_id', isAuth, addParticipants);
router.put('/participant/:event_id', isAuth, updateReponse);



module.exports = router;
