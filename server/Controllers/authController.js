const { User } = require('../models/Usermodel');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { ForgetPasswordEmail,SendOtpMail } = require('../config/nodemailer');
const { OAuth2Client } = require('google-auth-library');
const login = async (req, res) => {
    const { email, motDePasse } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ msg: 'No user found' });

        const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
        if (!isMatch) return res.status(401).json({ msg: 'Incorrect password' });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        user.otpCode = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send OTP via email
        await SendOtpMail(user.email, 'Your OTP code', otp);

        return res.status(200).json({ msg: 'OTP sent to email', step: 'verify_otp' });
    } catch (err) {
        res.status(500).json({ msg: 'Operation failed' });
    }
};
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || user.otpCode !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ msg: 'Invalid or expired OTP' });
        }

        user.Status = 'active';
        user.otpCode = null;
        user.otpExpires = null;
        await user.save();

        const token = jwt.sign({ id: user._id }, 'zied', { expiresIn: '10h' });

        res.status(200).json({ token, role: user.role, msg: 'Login successful' });
    } catch (err) {
        res.status(500).json({ msg: 'OTP verification failed' });
    }
}
const forgetPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ msg: 'No user found' });
        }

        // Generate a new password
        const newPassword = crypto.randomBytes(8).toString('hex');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the password
        user.motDePasse = hashedPassword;
        await user.save();

        // Debug log (remove in production)
        console.log(`Password updated for user ${email}`);

        // Send the new password to the user's email
        await ForgetPasswordEmail(email, newPassword);

        return res.status(200).json({
            msg: 'New password sent to your email'
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Server error' });
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

}

const client = new OAuth2Client('398876415878-tcp8anmiqvpd2datpfh7t47d4rgg4ipe.apps.googleusercontent.com');

const googleLogin = async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: '398876415878-tcp8anmiqvpd2datpfh7t47d4rgg4ipe.apps.googleusercontent.com',
        });
        const payload = ticket.getPayload();
        const { email, name, sub } = payload;
        let user = await User.findOne({ email });
        const jwtToken = jwt.sign({ id: user._id }, 'zied', { expiresIn: '10h' });
        res.status(200).json({ token: jwtToken, role: user.role });
    } catch (err) {
        res.status(500).json({ msg: 'Google login failed' });
    }
};

const googleRegister = async (req, res) => {
    const { token } = req.body;
console.log("toekn",token);
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: '398876415878-tcp8anmiqvpd2datpfh7t47d4rgg4ipe.apps.googleusercontent.com',
        });

        const payload = ticket.getPayload();
        const { email, name, sub } = payload;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const newUser = new User({
            email,
            name,
            googleId: sub,
            Status: 'active',
        });

        await newUser.save();

        const jwtToken = jwt.sign({ id: newUser._id }, 'zied', { expiresIn: '10h' });

        res.status(200).json({ token: jwtToken, role: newUser.role, msg: 'Registration successful' });
    } catch (err) {
        res.status(500).json({ msg: 'Google registration failed' });
    }
};


module.exports = {
    login,
    forgetPassword,
    signup,
    verifyOtp,
    googleLogin,
    googleRegister

}