const express = require('express');
const router = express.Router();
const isAuth = require("../Middleware/isauth");
const isAdmin = require("../Middleware/adminorganisation");

const {

    addOrganisation,
    editOrganisation,
    deleteOrganisation,
    getAllOrganisations,
    getOrganisationById,
    joinOrganisation,
    checkUserOrganisation,
    getAllUsersOfOrganization

} = require("../Controllers/organisationController");

//get all users of an organisation
router.get("/getall/:organisationId", isAuth,isAdmin, getAllUsersOfOrganization)

router.post("/join", isAuth,joinOrganisation,);

router.post("/add", isAuth, addOrganisation);

//check if user has an organisation
router.get("/check", isAuth, checkUserOrganisation)

router.delete("/delete", isAuth, deleteOrganisation);

router.put("/edit", isAuth, editOrganisation);

router.get("/organisations", isAuth, getAllOrganisations);

router.get("/:id", isAuth, getOrganisationById);

module.exports = router;