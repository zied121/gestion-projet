const express = require('express');
const router = express.Router();
const isAuth = require("../Middleware/isauth");
const { adminOrganisationMiddleware } = require("../Middleware/adminorganisation");
const upload = require('../Middleware/multer'); // using memoryStorage


const {
    createUser,
    getOneUser,
    deleteUser,
    updateUser,
    populateUsers,
} = require("../Controllers/userController");

router.post("/add/:organisationId", isAuth, adminOrganisationMiddleware, createUser);
router.delete("/delete/:organisationId/:id", isAuth, adminOrganisationMiddleware, deleteUser);
router.put("/update/:id", isAuth, upload.single('image'), updateUser);
router.get("/getone", isAuth, getOneUser);
router.post("/populate", populateUsers);

module.exports = router;