const express = require("express");
const router = express.Router();
const contentController = require("../controllers/content.controller");
const verifyToken = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const { ROLE } = require("../config/constants");

// Public: page content keys (about_*, contact_*) for the website
router.get("/", contentController.getPublicContent);

// Super Admin: update page content keys
router.put("/", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN), contentController.updateContent);

module.exports = router;
