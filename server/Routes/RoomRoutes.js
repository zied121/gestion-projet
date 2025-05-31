const express = require("express");
const router = express.Router();
const isAuth = require("../Middleware/isauth");
const isAdmin = require("../Middleware/adminorganisation");
const authMiddleware = require("../Middleware/isauth");
const validate = require('../Middleware/validate');
const { ValideRoomSchema } = require("../models/Room");
const upload = require("../Middleware/upload");

const {
    getRooms,searchRooms,getRoomsByUser, getRoomsByOwner,getRoomById,deleteRoom , createRoom ,getLastMessage, getProjectPerUser, createGoogleMeet , getAllRooms,updateRoom , createRoomPerProject, createPrivateRoom
} = require("../Controllers/roomController");

//Admin routes
//router.post("/addRoom", isAuth,isAdmin, createRoom)
//router.put("/UpdateRoom", isAuth,isAdmin, updateRoom)
//router.get("/", isAuth, getRooms)
router.get("/",isAuth, getRooms)
router.get("/allrooms",isAuth, getAllRooms)
router.get("/getProjectPerUser", isAuth, getProjectPerUser)  
router.get("/getRoomByID/:id",isAuth, getRoomById)  
router.post("/addRoom" , isAuth ,validate(ValideRoomSchema), createRoom)
router.post("/RoomForProject/:id" , isAuth, upload.single('image') ,validate(ValideRoomSchema), createRoomPerProject)
router.post('/CreatePrivateRoom', isAuth, createPrivateRoom); 
///router.post("/addRoom" , isAuth , validate(valideRoomSchema) , createRoom) 
router.put("/UpdateRoom/:id" , isAuth, upload.single('image'), updateRoom)
router.delete("/DeleteRoom/:id", isAuth, deleteRoom)
router.post('/:id/start-call', createGoogleMeet);
router.get('/searchRoom',isAuth , searchRooms);
router.get('/getRoomsPerUser', isAuth, getRoomsByUser);
router.get("/getRoomsPerowner", isAuth, getRoomsByOwner);
router.get('/getRoomUsers/:id', isAuth, getRoomUsers);
//User routes
router.get('/room/:roomId/last', getLastMessage );

router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ roomId })
      .populate('sender', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      messages: messages.reverse(),
      currentPage: page,
      totalPages: Math.ceil(await Message.countDocuments({ roomId }) / limit)
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get last message by room
router.get('/:roomId/last', async (req, res) => {
  try {
    const { roomId } = req.params;

    const lastMessage = await Message.findOne({ roomId })
      .populate('sender', 'name email')
      .sort({ createdAt: -1 });

    if (!lastMessage) {
      return res.status(404).json({ message: 'No messages found' });
    }

    res.json(lastMessage);
  } catch (error) {
    console.error('Error fetching last message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send message
router.post('/', async (req, res) => {
  try {
    const { roomId, content, messageType = 'text' } = req.body;
    const userId = req.user.id;

    // Verify user is member of the room
    const room = await Room.findById(roomId);
    if (!room || !room.members.includes(userId)) {
      return res.status(403).json({ error: 'Not authorized to send messages to this room' });
    }

    const message = new Message({
      content,
      sender: userId,
      roomId,
      messageType
    });

    await message.save();
    await message.populate('sender', 'name email');

    // Emit socket event
    req.io.to(roomId).emit('newMessage', {
      ...message.toObject(),
      roomId
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// NEW ROUTES - Seen functionality

// Mark messages as seen
router.put('/:roomId/seen', async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    // Verify user is member of the room
    const room = await Room.findById(roomId);
    if (!room || !room.members.includes(userId)) {
      return res.status(403).json({ error: 'Not authorized to access this room' });
    }

    // Update all unread messages in the room for this user
    const updateResult = await Message.updateMany(
      {
        roomId: roomId,
        sender: { $ne: userId }, // Don't mark own messages as seen
        'seenBy.userId': { $ne: userId } // Only messages not already seen
      },
      {
        $push: {
          seenBy: {
            userId: userId,
            seenAt: new Date()
          }
        },
        $addToSet: {
          isSeenBy: userId // Add to quick lookup array
        }
      }
    );

    // Emit socket event
    req.io.to(roomId).emit('messagesSeen', {
      roomId: roomId,
      userId: userId,
      count: updateResult.modifiedCount
    });

    res.json({
      success: true,
      message: 'Messages marked as seen',
      markedCount: updateResult.modifiedCount
    });
  } catch (error) {
    console.error('Error marking messages as seen:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get unread count for a specific room
router.get('/:roomId/unread-count', async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    // Verify user is member of the room
    const room = await Room.findById(roomId);
    if (!room || !room.members.includes(userId)) {
      return res.status(403).json({ error: 'Not authorized to access this room' });
    }

    const unreadCount = await Message.countDocuments({
      roomId: roomId,
      sender: { $ne: userId },
      isSeenBy: { $ne: userId }
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get unread counts for all user's rooms
router.get('/unread-counts', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all rooms user belongs to
    const userRooms = await Room.find({
      members: userId
    }).select('_id');

    const roomIds = userRooms.map(room => room._id);

    // Aggregation pipeline to get unread counts efficiently
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          roomId: { $in: roomIds },
          sender: { $ne: mongoose.Types.ObjectId(userId) },
          isSeenBy: { $ne: mongoose.Types.ObjectId(userId) }
        }
      },
      {
        $group: {
          _id: '$roomId',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert to object format
    const result = {};
    roomIds.forEach(roomId => {
      result[roomId.toString()] = 0; // Initialize all rooms with 0
    });

    unreadCounts.forEach(item => {
      result[item._id.toString()] = item.count;
    });

    res.json(result);
  } catch (error) {
    console.error('Error getting unread counts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get messages with seen status
router.get('/:roomId/with-seen', async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Verify user is member of the room
    const room = await Room.findById(roomId);
    if (!room || !room.members.includes(userId)) {
      return res.status(403).json({ error: 'Not authorized to access this room' });
    }

    const messages = await Message.find({ roomId })
      .populate('sender', 'name email')
      .populate('seenBy.userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      messages: messages.reverse(),
      currentPage: page,
      totalPages: Math.ceil(await Message.countDocuments({ roomId }) / limit)
    });
  } catch (error) {
    console.error('Error fetching messages with seen status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark specific message as seen
router.put('/:messageId/seen', async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    } }
    catch (error) {
        console.error('Error marking message as seen:', error);}
    })
module.exports = router;