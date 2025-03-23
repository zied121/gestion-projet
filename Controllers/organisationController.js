const express = require('express');
const Organisation = require('../models/OrganisationModel'); // Assuming you have a model defined

const addOrganisation = async (req, res) => {
    try {
        const newOrganisation = new Organisation(req.body);
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
    try {
        const organisation = await Organisation.findById(req.params.id);
        const user = await User.findById(req.user.id);
        if (organisation.members.includes(user._id)) {
            return res.status(400).json({ message: 'You have already joined this organisation' });
        }
        organisation.members.push(user._id);
        await organisation.save();
        res.status(200).json({ message: 'You have successfully joined this organisation' });
    } catch (err) {
        res.status(400).json({ message: err.message });
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
