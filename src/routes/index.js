const express = require("express");
const router = express.Router();

// Auth Routes
router.use("/auth", require("./auth.routes"));

// Property Routes
router.use("/properties", require("./property.routes"));

// User Routes
router.use("/users", require("./user.routes"));


module.exports = router;