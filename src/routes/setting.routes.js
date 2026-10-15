const express = require("express");
const router = express.Router();
const settingController = require("../controllers/setting.controller");
const verifyToken = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const { ROLE } = require("../config/constants");

// Authenticated: read platform settings
router.get("/", verifyToken, settingController.getSettings);

// Super Admin: update platform settings
router.put("/", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN), settingController.updateSettings);

module.exports = router;
