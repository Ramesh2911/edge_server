const express = require("express");
const router = express.Router();

// Auth Routes
router.use("/auth", require("./auth.routes"));

// Property Routes
router.use("/properties", require("./property.routes"));


module.exports = router;