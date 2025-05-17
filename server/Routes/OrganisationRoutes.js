const express = require('express');
const router = express.Router();
const isAuth = require("../Middleware/isauth");
const isAdmin = require("../Middleware/adminorganisation");
const upload = require('../Middleware/multer'); // using memoryStorage

const {

    addOrganisation,
    editOrganisation,
    deleteOrganisation,
    getAllOrganisations,
    getOrganisationById,
    joinOrganisation,
    checkUserOrganisation,
    getAllUsersOfOrganization,
    analytics

} = require("../Controllers/organisationController");

//get all users of an organisation
router.get("/getall/:organisationId", isAuth,isAdmin, getAllUsersOfOrganization)

router.post("/join", isAuth,joinOrganisation,);

router.post("/add", isAuth, addOrganisation);

router.get("/organisations", isAuth, getAllOrganisations);

router.get("/analytics", isAuth, analytics);

//check if user has an organisation
router.get("/check", isAuth, checkUserOrganisation)

router.delete("/delete/:id", isAuth, deleteOrganisation);

router.put("/edit/:id", isAuth,upload.single('image'), editOrganisation);

router.get("/:id", isAuth, getOrganisationById);

module.exports = router;