const { Room , RoomSchema , validateRoomSchema} = require("../models/Room");
const { Project, projectValidationSchema } = require('../models/ProjectModel');
const { User } = require("../models/Usermodel")
const { google } = require('googleapis');
const { oauth2Client } = require('../config/googleAuth');
const { Message } = require("../models/MessageModal");
/*const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};*/
const getRooms = async (req, res) => {
  try {
    const userId = req.user._id; // Assure-toi que req.user existe grâce à ton middleware isAuth

    const rooms = await Room.find({
      members: userId // On cherche où l'utilisateur est dans le tableau "members"
    });

    res.json(rooms);
  } catch (error) {
    console.error("Erreur lors de la récupération des rooms :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find(); // Récupère toutes les rooms sans condition
    res.status(200).json(rooms);
  } catch (error) {
    console.error("Erreur lors de la récupération de toutes les rooms :", error);
    res.status(500).json({ message: "Erreur serveur" });
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
    const projectId = req.params.id; 
    const { name } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Vous devez être propriétaire de ce projet pour créer une room' });
    }

    const newRoom = new Room({
      name: name ? name : `Room-${project.name}`,
      owner: req.user._id,  
      members: project.members,
      project: project._id
    });
    console.log("room", req.body);
    const savedRoom = await newRoom.save();
    const io = req.app.get('io');
    project.members.forEach(member => {
      io.to(member._id.toString()).emit('newRoomCreated', savedRoom);
    });
    res.status(201).json(savedRoom);
  } catch (error) {
    console.error("Erreur lors de la création de la room :", error);
    res.status(400).json({ message: error.message });
  }
}


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
    console.log(req.body);
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


//room par event
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
    const { roomName, image, members, project } = req.body;

    const room = new Room({
      name: roomName,
      image: image,
      members: members,
      project: project,
      owner: req.user._id
    });

    const savedRoom = await room.save();

    const populatedRoom = await Room.findById(savedRoom._id)
      .populate('members', 'nom email')
      .populate('project', 'name description');

    res.status(201).json(populatedRoom);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};
//   const createRoom = async (req, res) => {
//     try {
//         const room = new Room({
//             ...req.body,
//           owner: req.user._id
//         });
//         const savedRoom = await room.save();
//         res.status(201).json(savedRoom);
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// };
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
    const room = await Room.findById(roomId)//.populate('owner'); 
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
 const user = await User.findById(req.user._id);
 console.log("user", user);
    // Set credentials directly using your access and refresh tokens
    oauth2Client.setCredentials({
      access_token: user.google.access_token,
      refresh_token:  user.google.refresh_token,
    });

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

    // lien de la réunion Google Meet
    const meetLink = response.data.hangoutLink;

    res.json({ meetLink });
  } catch (error) {
    console.error('Error creating Google Meet:', error);
    res.status(500).json({ message: 'Erreur lors de la création du meeting' });
  }
};
const createPrivateRoom = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({ message: 'Other user ID is required' });
    }

    // Vérifie si la room existe déjà
    const existingRoom = await Room.findOne({
      isPrivate: true,
      members: { $all: [userId, otherUserId], $size: 2 }
    });

    if (existingRoom) {
      return res.status(200).json({ message: 'Room already exists', room: existingRoom });
    }

    // Récupérer les infos de l'autre utilisateur
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ message: 'Other user not found' });
    }

    // Créer la room avec le nom de l’autre utilisateur
    const room = new Room({
      name: `${otherUser.nom}`, // ou otherUser.username/fullName/etc.
      members: [userId, otherUserId],
      owner: userId,
      isPrivate: true
    });

    await room.save();

    const populatedRoom = await Room.findById(room._id).populate('members');

    const io = req.app.get('io');
    populatedRoom.members.forEach(member => {
      io.to(member._id.toString()).emit('newRoomCreated', populatedRoom);
    });

    res.status(201).json(populatedRoom);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

   

/*
const createPrivateRoom = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.body;
   // const otherUser = await Utilisateur.findById(otherUserId);
    //console.log(otherUser)
    const existingRoom = await Room.findOne({
      isPrivate: true,
      members: { $all: [userId, otherUserId], $size: 2 }
    });

    if (existingRoom) {
      return res.status(200).json({ message: 'Room already exists', room: existingRoom });
    }
    const room = new Room({
     //name: `Private- ${otherUser.nom}`,
     name: `Private- ${otherUserId}`,
      members: [userId, otherUserId],
      owner: userId,  
      isPrivate: true
    });

    await room.save();

    const populatedRoom = await Room.findById(room._id).populate('members');

    res.status(201).json(populatedRoom);
    const io = req.app.get('io');
    project.members.forEach(member => {
      io.to(member._id.toString()).emit('newRoomCreated', savedRoom);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}*//////
/*
export const getRoomsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const rooms = await Room.find({ participants: userId }).populate('participants', 'nom email');

    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch rooms', error: err });
  }
}*/
const searchRooms = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    const rooms = await Room.find({
      name: { $regex: query, $options: 'i' } 
    });

    res.json(rooms);
  } catch (error) {
    console.error('Erreur lors de la recherche des rooms:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
// In your room controller (backend)
/*const searchRooms = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user._id; // Assuming you have user authentication

    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    const rooms = await Room.find({
      $and: [
        { members: userId },
        { name: { $regex: query, $options: 'i' } }
      ]
    })
    .populate('lastMessage')
    .populate('members', 'name email avatar')
    .sort({ updatedAt: -1 });

    res.json(rooms);
  } catch (error) {
    console.error('Error searching rooms:', error);
    res.status(500).json({ message: "Server error" });
  }
};*/
const getRoomsByOwner = async (req, res) => {
  try {
    const ownerId = req.user._id;

    const rooms = await Room.find({ owner: ownerId })
        .populate('project', '_id name')
        .populate('members', 'nom email')
        .populate('owner', 'nom email')
        .select('name owner members project projectID'); // Inclure projectID

    if (!rooms || rooms.length === 0) {
      return res.status(404).json({ message: 'Aucune room trouvée pour ce propriétaire' });
    }

    res.status(200).json(rooms);
  } catch (error) {
    console.error('Erreur lors de la récupération des rooms par propriétaire :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

const updateRoomDetails = async (req, res) => {
  try {
    const roomId = req.params.id;
    const userId = req.user._id;
    const { name, image, members, project } = req.body;

    // Vérifier si la room existe
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room non trouvée" });
    }

    // Vérifier si l'utilisateur est le propriétaire de la room
    if (room.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à mettre à jour cette room" });
    }

    // Mettre à jour les champs de la room
    if (name) room.name = name;
    if (image) room.image = image;
    if (members) room.members = members;
    if (project) room.project = project;

    // Sauvegarder les modifications
    const updatedRoom = await room.save();

    // Renvoyer la room mise à jour
    const populatedRoom = await Room.findById(updatedRoom._id)
      .populate('project', 'name description')
      .populate('members', 'nom email')
      .populate('owner', 'nom email');

    res.status(200).json(populatedRoom);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la room :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};





const getRoomsByUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const rooms = await Room.find({ members: userId });

    if (!rooms || rooms.length === 0) {
      return res.status(404).json({ message: 'Aucune room trouvée pour cet utilisateur' });
    }

    res.status(200).json(rooms);
  } catch (error) {
    console.error('Erreur lors de la récupération des rooms :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
const getLastMessage = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Find the most recent message for the room - no populate needed
    const lastMessage = await Message.findOne({ room: roomId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .exec();

    if (!lastMessage) {
      return res.status(404).json({ message: 'No messages found for this room' });
    }

    res.json(lastMessage);
  } catch (error) {
    console.error('Error getting last message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getRooms, searchRooms, getRoomsByUser, createPrivateRoom, createGoogleMeet, getRoomById, getLastMessage, deleteRoom , createRoom , getProjectPerUser ,createRoomPerProject, updateRoomsec,getAllRooms,getRoomsByOwner,updateRoomDetails};
