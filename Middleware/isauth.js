const jwt = require('jsonwebtoken');
const User = require('../models/Usermodel');
const isauth = async (req, res, next) => {
    try {
        const token = req.header("token");
        const verifyToken = await jwt.verify(token, "zied");
        if (!verifyToken) {
            return response.status(401).json({
                message: "you are authorized"
            });
        }

        const user = await User.findById(verifyToken._id);
        req.user = verifyToken._id;
        req.role=verifyToken.role;

        next();
    } catch (err) {

        res.status(400).json({
            msg: "sssssssssssssssss"
        });
    }

}
module.exports = isauth;