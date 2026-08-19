const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
const verifyToken = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const { ROLE } = require("../config/constants");

router.get("/stats", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN), dashboardController.getSuperAdminStats);
router.get("/admin/stats", verifyToken, roleMiddleware(ROLE.ADMIN_A, ROLE.ADMIN_B), dashboardController.getAdminStats);
router.get("/logs", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN), dashboardController.getLogs);
router.get("/property-stats", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN), dashboardController.getPropertyStats);

module.exports = router;
