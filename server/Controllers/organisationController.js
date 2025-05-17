const mongoose = require('mongoose');
const {Organisation,OrganisationYupSchema} = require('../models/OrganisationModel'); // Assuming you have a model defined
const { User } = require('../models/Usermodel');
const cloudinary = require('../config/cloudinary'); // adjust path if needed
const streamifier = require('streamifier');

const addOrganisation = async (req, res) => {
    console.log("eaz",req.user._id);
    try {
        const foundUser = await User.findById(req.user._id); // Use req.user._id directly

         await OrganisationYupSchema.validate(req.body);

        if (!foundUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const newOrganisation = new Organisation({
            ...req.body,
            admin: foundUser._id,
        });

        const savedOrganisation = await newOrganisation.save();

        foundUser.Organisation_id = savedOrganisation._id;
        foundUser.role = "admin";
        await foundUser.save();

        res.status(201).json({message: "Organisation created successfully", organisation: savedOrganisation });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const editOrganisation = async (req, res) => {
    console.log(req.body);
    console.log(req.params.id);

    try {
        const organisationFound = await Organisation.findById(req.params.id);
        if (!organisationFound) {
            return res.status(404).json({ msg: 'Organisation not found' });
        }

        const updateData = { ...req.body };

        if (req.file) {
            const streamUpload = () => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'organisation_images',
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

        const updatedOrganisation = await Organisation.findByIdAndUpdate(req.params.id, updateData, { new: true });

        res.status(200).json(updatedOrganisation);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Update failed', error: err.message });
    }
};
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
        const organisations = await Organisation.find().lean();
        const organisationIds = organisations.map(org => org._id);

        // Fetch users grouped by organisation
        const users = await User.find({ Organisation_id: { $in: organisationIds } }).lean();

        // Group users by organisation id
        const usersByOrg = {};
        users.forEach(user => {
            const orgId = user.Organisation_id?.toString();
            if (!usersByOrg[orgId]) usersByOrg[orgId] = [];
            usersByOrg[orgId].push(user);
        });

        // Attach users to each organisation
        const organisationsWithUsers = organisations.map(org => ({
            ...org,
            users: usersByOrg[org._id.toString()] || []
        }));

        res.status(200).json(organisationsWithUsers);
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
        user.role= "Membre";
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
    const { organisationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const [users, total] = await Promise.all([
            User.find({ Organisation_id: organisationId })
                .skip(skip)
                .limit(limit),
            User.countDocuments({ Organisation_id: organisationId })
        ]);

        if (!users || users.length === 0) {
            return res.status(404).json({
                msg: 'No users found for this organization'
            });
        }

        res.status(200).json({
            users,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalUsers: total
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({
            msg: "Operation failed"
        });
    }
};


const analytics = async (req, res) => {
    try {
        // Count total organisations
        const totalOrganisations = await Organisation.countDocuments();

        // Count total users
        const totalUsers = await User.countDocuments();

        // Count organisations by category
        const organisationsByCategory = await Organisation.aggregate([
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            totalOrganisations,
            totalUsers,
            organisationsByCategory
        });
    } catch (err) {
        res.status(500).json({ message: 'Analytics fetch failed', error: err.message });
    }
};

module.exports = {
    addOrganisation,
    editOrganisation,
    deleteOrganisation,
    getAllOrganisations, 
    getOrganisationById,
    joinOrganisation,
    checkUserOrganisation,
    getAllUsersOfOrganization,
    analytics
};
