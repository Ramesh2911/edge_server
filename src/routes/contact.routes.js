const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contact.controller");
const verifyToken = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const { ROLE } = require("../config/constants");

// Public — website ContactForm + app Contact/LeadPopup
router.post("/", contactController.createMessage);

// Admin — contact message inbox
router.get("/", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN, ROLE.ADMIN_A, ROLE.ADMIN_B), contactController.listMessages);

module.exports = router;
