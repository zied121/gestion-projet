const {User} = require('../models/Usermodel');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const {Organisation} = require('../models/OrganisationModel');
const { sendOrganiastionCodeEmail } = require('../config/nodemailer');
const cloudinary = require('../config/cloudinary'); // adjust path if needed
const streamifier = require('streamifier');
const { Project } = require('../models/ProjectModel'); // Make sure this path is correct
const { Team } = require('../models/Team'); // Make sure this path is correct
const getOneUser = async (req, res) => {
    const id = req.user;
    try {
        const user = await User.findById(id).populate('Organisation_id');
        if (!user.Organisation_id) {
            return res.status(200).json({
                user,
                msg: "Aucune organisation associée à cet utilisateur."
            });
        }
        console.log("user",user)

    if (!user) {
      return res.status(401).json({
        msg: 'No user found'
      });
    } else {
      res.status(200).json({
        user
      });
    }

  } catch (err) {
    res.status(400).json({
      msg: "operation failed"
    });
  }

};

const updateUser = async (req, res) => {
  const id = req.params.id;

  try {
    const userFound = await User.findById(id);
    if (!userFound) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const updateData = { ...req.body };

    if (req.file) {
      const streamUpload = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'profile_images',
              resource_type: 'image',
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };

      const uploadResult = await streamUpload();
      updateData.image = uploadResult.secure_url;
    }

    await User.findByIdAndUpdate(id, updateData);

    return res.status(200).json({ msg: 'User updated successfully' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Update failed', error: err.message });
  }
}
const createUser = async (req, res) => {
    const user = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        user.motDePasse = await bcrypt.hash(user.motDePasse, salt);

        const newUser = new User({ ...user, Organisation_id: req.params.organisationId });
        await newUser.save();

        await Organisation.findByIdAndUpdate(
            req.params.organisationId,
            { $push: { membres: newUser._id } },
            { new: true }
        );
        await sendOrganiastionCodeEmail(user.email, user.motDePasse);

        res.status(200).json({
            msg: 'user created successfully'
        });

    } catch (err) {
        res.status(400).json({
            msg: "operation failed"
        });
    }

};



const deleteUser = async (req, res) => {
        const id = req.params.id;
        try {
            const user = await User.findById(id);
            if (!user) {

                return res.status(401).json({
                    msg: 'No user found'
                });

            } else {
                await User.findByIdAndDelete(id);

                await Organisation.findByIdAndUpdate(
                    user.Organisation_id,
                    {$pull: {membres: id}},
                    {new: true}
                );
                res.status(200).json({
                    msg: 'user deleted successfully'
                });
            }

        } catch (err) {
            res.status(400).json({
                msg: "operation failed"
            });
        }
    }

    const getAllUsers = async (req, res) => {
        try {
            const users = await User.find()
            if (!users) {
                return res.status(401).json({
                    msg: 'No user found'
                });
            } else {
                res.status(200).json({
                    users
                });
            }

        } catch (err) {
            res.status(400).json({
                msg: "operation failed"
            });
        }
    };


const analyticsForUser = async (req, res) => {
    try {
        const organisationId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(organisationId)) {
            return res.status(400).json({ message: 'Invalid Organisation ID' });
        }

        // Count total users in the organisation
        const totalUsers = await User.countDocuments({ Organisation_id: organisationId });

        // Count active users (assuming you have an 'active' field)
        const activeUsers = await User.countDocuments({ Organisation_id: organisationId, Status: "active" });

        // Count not active users
        const notActiveUsers = await User.countDocuments({ Organisation_id: organisationId, Status: "inactive" });

        // Count total projects in the organisation
        const totalProjects = await Project.countDocuments({ Organisation_id: organisationId });
        const totalTeams = await Team.countDocuments({ Organisation_id: organisationId });


        res.status(200).json({
            organisationId,
            totalUsers,
            activeUsers,
            notActiveUsers,
            totalProjects,
            totalTeams
        });
    } catch (err) {
        res.status(500).json({ message: 'Analytics fetch failed', error: err.message });
    }
}

const getFilteredUsers = async (req, res) => {
  const { search, role, status, organisationId } = req.query;
  console.log("organisationId",req.query)

  let filter = {};
  if (organisationId && mongoose.Types.ObjectId.isValid(organisationId)) {
    filter.Organisation_id = new mongoose.Types.ObjectId(organisationId);
  }

  if (search) {
    filter.$or = [
      { nom: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (role) filter.role = role;
  if (status) filter.Status = status;

  console.log("filter",filter)
  try {
    const users = await User.find(filter).populate('teams');
    console.log("users",users)
    res.status(200).json({
      Users: users,
      msg: 'Users fetched successfully'
    }) ;
  } catch (err) {
    res.status(500).json({ msg: 'Fetch failed', error: err.message });
  }
}



module.exports = {
    createUser,
    getOneUser,
    deleteUser,
    updateUser,
    getAllUsers,
    analyticsForUser,
    getFilteredUsers
    

};