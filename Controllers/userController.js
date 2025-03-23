const User = require('../models/Usermodel');
const bcrypt = require('bcrypt');

const getOneUser = async (req, res) => {
    const id = req.user;
    try {
        const user = await User.findById(id);

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
   const id = req.user;
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
        user.password = await bcrypt.hash(user.password, salt);
        
        const newUser = new User(user);
        await newUser.save();
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
    const id = req.user;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(401).json({
                msg: 'No user found'
            });
        } else {
            await User.findByIdAndDelete(id);
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
    updateUser

};