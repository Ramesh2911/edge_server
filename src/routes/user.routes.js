const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth.middleware");
const userController = require("../controllers/user.controller");

// Apply verifyToken middleware across all routes
router.get("/owners", verifyToken, userController.getOwners);
router.get("/buyers", verifyToken, userController.getBuyers);
router.get("/developers", verifyToken, userController.getDevelopers);
router.get("/brokers", verifyToken, userController.getBrokers);

module.exports = router;