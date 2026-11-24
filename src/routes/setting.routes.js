const express = require("express");
const router = express.Router();
const settingController = require("../controllers/setting.controller");
const verifyToken = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const { ROLE } = require("../config/constants");

// Authenticated: read platform settings
router.get("/", verifyToken, settingController.getSettings);

// Public: selected copy keys for the website/app (newsletter + popup headings, point 17)
router.get("/public", settingController.getPublicSettings);

// Super Admin: update platform settings
router.put("/", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN), settingController.updateSettings);

module.exports = router;
