const User = require('../models/Usermodel');
const bcrypt = require('bcrypt');
const Organisation = require('../models/OrganisationModel');
const { sendOrganiastionCodeEmail } = require('../config/nodemailer');

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
    const user = req.body;
    try {
        const userFound = await User.findById(id);
       
        if (!userFound) {
            return res.status(401).send({
                msg: 'No user found'
            });
            
        } else {
            await User.findByIdAndUpdate(id, user);
            res.status(200).json({
                msg: 'user updated successfully'
            });
        }

    } catch (err) {
        res.status(400).json({
            msg: "update is failed"
        });
    }

};

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