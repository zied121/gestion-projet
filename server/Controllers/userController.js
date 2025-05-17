const {User} = require('../models/Usermodel');
const bcrypt = require('bcrypt');
const {Organisation} = require('../models/OrganisationModel');
const { sendOrganiastionCodeEmail } = require('../config/nodemailer');
const cloudinary = require('../config/cloudinary'); // adjust path if needed
const streamifier = require('streamifier');

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
                { $pull: { membres: id } },
                { new: true }
            );
            res.status(200).json({
                msg: 'user deleted successfully'
            });
        }

    }
    catch (err) {
        res.status(400).json({
            msg: "operation failed"
        });
    }
}

module.exports = {
    createUser,
    getOneUser,
    deleteUser,
    updateUser,
    
    

};