const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contact.controller");

// Public — website ContactForm + app Contact/LeadPopup
router.post("/", contactController.createMessage);

module.exports = router;
