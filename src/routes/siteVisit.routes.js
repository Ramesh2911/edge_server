const express = require("express");
const router = express.Router();
const siteVisitController = require("../controllers/siteVisit.controller");
const siteVisitValidation = require("../validations/siteVisit.validation");
const validate = require("../middleware/validation.middleware");
const verifyToken = require("../middleware/auth.middleware");

router.get("/", verifyToken, siteVisitController.getVisits);
router.post("/", verifyToken, siteVisitValidation.createVisitValidation, validate, siteVisitController.createVisit);
router.patch("/:id/status", verifyToken, siteVisitValidation.updateVisitStatusValidation, validate, siteVisitController.updateVisitStatus);
router.delete("/:id", verifyToken, siteVisitController.removeVisit);

module.exports = router;
