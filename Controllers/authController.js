const User = require('../models/Usermodel');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const login = async (req, res) => {
    const { email, motDePasse } = req.body;
    try {
        const user = await User.findOne({
            email
        });
        if (!user) {
            return res.status(401).json({
                msg: 'No user found'
            });
        }
        const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
        if (!isMatch) {
            return res.status(401).json({
            msg: 'Incorrect password'
            });
        }

        // Generate a token
        const token = jwt.sign({ id: user._id }, 'zied', { expiresIn: '10h' });

        res.status(200).json({
            token
        });
    }
    catch (err) {
        res.status(400).json({
            msg: "operation failed"
        });
    }
}
const forgetPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({
            email
        });
        if (!user) {
            return res.status(401).json({
                msg: 'No user found'
            });
        }

        // Generate a new password
        const newPassword = crypto.randomBytes(8).toString('hex');
        user.password = newPassword;
        await user.save();

        // Send the new password to the user's email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'your-email@gmail.com',
                pass: 'your-email-password'
            }
        });

        const mailOptions = {
            from: 'your-email@gmail.com',
            to: user.email,
            subject: 'Password Reset',
            text: `Your new password is: ${newPassword}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({
                    msg: 'Failed to send email'
                });
            } else {
                res.status(200).json({
                    msg: 'New password sent to your email'
                });
            }
        });
    }
    catch (err) {
        res.status(400).json({
            msg: "operation failed"
        });
    }
}

const signup = async (req, res) => {
    const user = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        user.motDePasse = await bcrypt.hash(user.motDePasse, salt);

        const newUser = new User(user);
        await newUser.save();
        res.status(200).json({
            msg: 'user created successfully'
        });

    } catch (err) {
        res.status(400).json({
            msg: "operation failed eae"
        });
    }

};



module.exports = {
    login,
    forgetPassword,
    signup

}