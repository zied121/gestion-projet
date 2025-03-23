const express = require('express');
const router = express.Router();
const isAuth = require("../Middleware/isauth");

const {

    addOrganisation,
    editOrganisation,
    deleteOrganisation,
    getAllOrganisations,
    getOrganisationById,
    joinOrganisation,


} = require("../Controllers/organisationController");

router.post("/organisation/add", isAuth, addOrganisation);
router.delete("/organisation/delete", isAuth, deleteOrganisation);
router.put("/organisation/edit", isAuth, editOrganisation);
router.get("/organisation/:id", isAuth, getOrganisationById);
router.get("/organisations", isAuth, getAllOrganisations);

router.post("/organisation/join/:id", isAuth,joinOrganisation,);
module.exports = router;