const mongoose = require('mongoose');
const Organisation = require('../models/OrganisationModel'); // Assuming you have a model defined
const User = require('../models/Usermodel');

const addOrganisation = async (req, res) => {
    console.log(req.user);
    try {
        const newOrganisation = new Organisation({
            ...req.body,
            admin: req.user
        });
        const savedOrganisation = await newOrganisation.save();

        const user = await User.findById(req.user.id);
        user.Organisation_id = savedOrganisation._id;
        await user.save();

        res.status(201).json(savedOrganisation);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}
const editOrganisation = async (req, res) => {
    try {
        const updatedOrganisation = await Organisation.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedOrganisation);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}
const deleteOrganisation = async (req, res) => {
    try {
        await Organisation.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Organisation deleted' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}
const getAllOrganisations = async (req, res) => {
    try {
        const organisations = await Organisation.find();
        res.status(200).json(organisations);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}
const getOrganisationById = async (req, res) => {
    try {
        const organisation = await Organisation.findById(req.params.id);
        res.status(200).json(organisation);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}
const joinOrganisation = async (req, res) => {
    const id  = req.body.code;

    if (!id) {
        return res.status(400).json({ message: 'Organisation ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid Organisation ID' });
    }

    try {
        const organisation = await Organisation.findById(id);
        if (!organisation) {
            return res.status(404).json({ message: 'Organisation not found' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if(user.Organisation_id){
            return res.status(400).json({ message: 'You are already in an organisation' });
        }

        organisation.membres.push(user._id);
        await organisation.save();

        user.Organisation_id = organisation._id;
         await user.save();        
        // const token = jwt.sign({ id: user._id, organisation_id: User.Organisation_id}, 'zied', { expiresIn: '10h' });
        // console.log("token",token);

        
        res.status(200).json({ message: 'You have successfully joined this organisation' ,organisation: organisation});
    
    } catch (err) {

        res.status(500).json({ message: 'Internal server error' });
    }
}
const checkUserOrganisation = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        console.log("here")
        if (!user) {
            return res.status(401).json({
                msg: 'No user found'
            });
        } else if (!user.Organisation_id) {
            return res.status(404).json({
                msg: 'No organisation found for this user'
            });
        } else {
            res.status(200).json({
                organisation: user.Organisation_id
            });
        }
    } catch (err) {
        res.status(400).json({
            msg: "operation failed"
        });
    }
}
const getAllUsersOfOrganization = async (req, res) => {
   
  
    try {
        const users = await User.find({ Organisation_id: req.params.organisationId});
        console.log(users);
        if (!users || users.length === 0) {
            return res.status(404).json({
                msg: 'No users found for this organization'
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
}
module.exports = {
    addOrganisation,
    editOrganisation,
    deleteOrganisation,
    getAllOrganisations, 
    getOrganisationById,
    joinOrganisation,
    checkUserOrganisation,
    getAllUsersOfOrganization
};
