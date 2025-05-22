const jwt = require('jsonwebtoken');
const { User } = require('../models/Usermodel');

const isauth = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(404).json({ message: "No token provided or malformed header" });
        }

        const token = authHeader.replace("Bearer ", "").trim();
        const decoded = jwt.verify(token, "zied");
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("Auth error:", err);
        res.status(401).json({ message: "Unauthorized access" });
    }
};

module.exports = isauth;
