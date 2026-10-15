const express = require("express");
const router = express.Router();

// Auth Routes
router.use("/auth", require("./auth.routes"));

// Property Routes
router.use("/properties", require("./property.routes"));

// User Routes
router.use("/users", require("./user.routes"));

// Dashboard Routes
router.use("/dashboard", require("./dashboard.routes"));

// Lead / Buyer Requirements Routes
router.use("/leads", require("./lead.routes"));

// Notification Routes
router.use("/notifications", require("./notification.routes"));

// SEO Routes
router.use("/seo", require("./seo.routes"));

// Site Settings Routes
router.use("/settings", require("./setting.routes"));

// Contact inquiry (public)
router.use("/contact", require("./contact.routes"));

module.exports = router;