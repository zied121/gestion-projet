const express = require('express');
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
        res.status(201).json(savedOrganisation);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


const editOrganisation = async (req, res) => {
    try {
        const updatedOrganisation = await Organisation.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedOrganisation);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


const deleteOrganisation = async (req, res) => {
    try {
        await Organisation.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Organisation deleted' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


const getAllOrganisations = async (req, res) => {
    try {
        const organisations = await Organisation.find();
        res.status(200).json(organisations);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


const getOrganisationById = async (req, res) => {
    try {
        const organisation = await Organisation.findById(req.params.id);
        res.status(200).json(organisation);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const joinOrganisation = async (req, res) => {
    const id  = req.body.code;

    if (!id) {
        return res.status(400).json({ message: 'Organisation ID is required' });
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

        if (organisation.membres.includes(user._id)) {
            return res.status(400).json({ message: 'You have already joined this organisation' });
        }

        organisation.membres.push(user._id);
        await organisation.save();

        res.status(200).json({ message: 'You have successfully joined this organisation' });
    } catch (err) {
        console.error('Error joining organisation:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    addOrganisation,
    editOrganisation,
    deleteOrganisation,
    getAllOrganisations, 
    getOrganisationById,
    joinOrganisation,
};
