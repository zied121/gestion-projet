const { Room , RoomSchema , validateRoomSchema} = require("../models/Room");

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

    const ownedProjects = await Project.find({ owner: userId }).populate('members', 'nom');
    
    if (ownedProjects.length === 0) {
      return res.status(403).json({ message: "Vous n'êtes propriétaire d'aucun projet." });
    }

    res.status(200).json(ownedProjects);
  } catch (error) {
    console.error("Erreur lors de la récupération des projets :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}






//by name ?
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: "Room non trouvée" });
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
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
/*const createRoom = async (req, res) => {
  try {
    const roomData = req.body;

    // Create and save the room
    const newRoom = new Room(roomData);
    const savedRoom = await newRoom.save();

    res.status(201).json(savedRoom);
  } catch (error) {
    console.error("Erreur création salle :", error);
  }};*/

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

const deleteRoom = async (req, res) => {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);
    if (!deletedRoom) return res.status(404).json({ error: "Room non trouvée" });

    res.json({ message: "Room supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = { getRooms, getRoomById, deleteRoom , createRoom , getProjectPerUser};
