const { Room , RoomSchema , validateRoomSchema} = require("../models/Room");
const Project = require ("../models/ProjectModal")

const { google } = require('googleapis');
const { oauth2Client } = require('../config/googleAuth');
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

const getProjectPerUser = async (req,res) => {
 
  try {
    const userId = req.user._id; // supposant que isauth middleware ajoute l'utilisateur dans req.user

    const ownedProjects = await Project.find({ owner: userId }).populate('members', 'nom role');
    
    if (ownedProjects.length === 0) {
      return res.status(403).json({ message: "Vous n'êtes propriétaire d'aucun projet." });
    }

    res.status(200).json(ownedProjects);
  } catch (error) {
    console.error("Erreur lors de la récupération des projets :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


const createRoomPerProject = async (req, res) => {
  try {
    //await ValideRoomSchema.validate(req.body, { abortEarly: false });
    const projectId = req.params.id; 
    const { roomName } = req.body; 

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Vous devez être propriétaire de ce projet pour créer une room' });
    }

    const newRoom = new Room({
      name: roomName,
      owner: req.user._id,  
      members: project.members,
      project: project._id
    });
    const savedRoom = await newRoom.save();

    res.status(201).json(savedRoom);
  } catch (error) {
    console.error("Erreur lors de la création de la room :", error);
    res.status(400).json({ message: error.message });
  }
}


//by name ?
const getRoomById = async (req, res) => {
  try {
    const roomId = req.params.id; 

    console.log("Room ID: ", roomId); 

    const room = await Room.findById(roomId); 

    if (!room) {
      return res.status(404).json({ error: "Room non trouvée" });
    }

    res.json(room);
  } catch (error) {
    console.error("Erreur lors de la récupération de la room :", error); // Ajout d'un log d'erreur pour le débogage
    res.status(500).json({ error: "Erreur serveur" });
  }
};



const updateRoomsec = async (req, res) => {
  try {
    const roomId = req.params.id; 
    const userId = req.user._id; 
    const room = await Room.findById(roomId)
    if (!room) {
      return res.status(404).json({ message: "Room non trouvée" });
    }

    if (!room.owner || room.owner._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Vous n'êtes pas le propriétaire de cette room" });
    }
const validatedData = await (req.body);
const updatedRoom = await Room.findByIdAndUpdate(req.params.id, validatedData, { new: true });
    
    res.status(200).json(updatedRoom); 
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la room :", error);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour de la room" });
  }
};



/*const createRoom = async (req, res) => {
  try {
    const validatedData = await (req.body);
    const newRoom = new Room(validatedData);
    await newRoom.save();
    
    res.status(201).json(newRoom);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
};*/


/* room par event
const createRoomPerEvent = async (req, res) => {
  try {
    const eventID = req.params.id; 
    const { roomName } = req.body; //event name

    const event = await Event.findById(eventID);
    if (!event) {
      return res.status(404).json({ message: 'Event non trouvé' });
    }

    if (event.organisateur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Vous devez être l organisateur pour créer une room' });
    }

    const newRoom = new Room({
      name: roomName,
      owner: req.user._id,  
      members: project.members,
      project: project._id
    });
    const savedRoom = await newRoom.save();

    res.status(201).json(savedRoom);
  } catch (error) {
    console.error("Erreur lors de la création de la room :", error);
    res.status(400).json({ message: error.message });
  }
}

*/

const updateRoom = async (req, res) => {
  try {
    //const validatedData = await roomValidationSchema.validate(req.body, { abortEarly: false });
    const validatedData = await valideRoomSchema(req.body, { abortEarly: false });

    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, validatedData, { new: true });

    if (!updatedRoom) return res.status(404).json({ error: "Room non trouvée" });

    res.json(updatedRoom);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
};


  const createRoom = async (req, res) => {
    try {
        const room = new Room({
            ...req.body,
          owner: req.user._id
        });
        const savedRoom = await room.save();
        res.status(201).json(savedRoom);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
/*
const deleteRoom = async (req, res) => {
  try {
 
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);
    if (!deletedRoom) return res.status(404).json({ error: "Room non trouvée" });

    res.json({ message: "Room supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};
*/

const deleteRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const room = await Room.findById(roomId).populate('owner'); 
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    if (room.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You are not authorized to delete this room" });
    }
  
    const deletedRoom = await Room.findByIdAndDelete(roomId);

    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};


/*
const createGoogleMeet = async (req, res) => {
  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const eventt = {
      summary: 'Meeting in Room',
      description: 'Auto-created meeting from chat room',
      start: {
        dateTime: new Date(),
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: new Date(new Date().getTime() + 30 * 60000),
        timeZone: 'Europe/Paris',
      },
      conferenceData: {
        createRequest: {
          requestId: 'some-random-id-' + Date.now(),
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: eventt,
      conferenceDataVersion: 1,
    });

    const meetLink = response.data.hangoutLink;
    res.json({ meetLink });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la création du meeting' });
  }
};*/


const createGoogleMeet = async (req, res) => {
  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const roomId = req.params.id;
    const room = await Room.findById(roomId).populate('members');
    //console.log(room);
    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    const attendees = room.members.map(member => ({
      email: member.email, 
    }));

    // Créer l'événement Google Calendar
    const eventt = {
     // summary: 'Meeting in Room',
     summary:`${room.name} - Meeting`,
      description: 'Auto-created meeting from chat room',
      start: {
        dateTime: new Date(),
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: new Date(new Date().getTime() + 30 * 60000), // Durée de 30 minutes
        timeZone: 'Europe/Paris',
      },
      attendees: attendees, 
      conferenceData: {
        createRequest: {
          requestId: 'some-random-id-' + Date.now(),
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    };

    // Insérer l'événement avec les données
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: eventt,
      conferenceDataVersion: 1,
    });

    // Extraire le lien de la réunion Google Meet
    const meetLink = response.data.hangoutLink;

    // Répondre avec le lien de la réunion
    res.json({ meetLink });
  } catch (error) {
    console.error('Error creating Google Meet:', error);
    res.status(500).json({ message: 'Erreur lors de la création du meeting' });
  }
};

module.exports = { getRooms, createGoogleMeet, getRoomById, deleteRoom , createRoom , getProjectPerUser ,createRoomPerProject, updateRoomsec};
