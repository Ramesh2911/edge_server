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

// Website Footer (contact + useful links) Routes
router.use("/footer", require("./footer.routes"));

// Contact inquiry (public)
router.use("/contact", require("./contact.routes"));

// Public page content (about_*, contact_* keys)
router.use("/content", require("./content.routes"));

// Blog posts (public + admin)
router.use("/blog", require("./blog.routes"));

// User activity feed
router.use("/activities", require("./activity.routes"));

// Deal Management
router.use("/deals", require("./deal.routes"));

// Site Visits
router.use("/site-visits", require("./siteVisit.routes"));

module.exports = router;