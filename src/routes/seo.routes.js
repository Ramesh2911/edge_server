const express = require("express");
const router = express.Router();
const seoController = require("../controllers/seo.controller");
const verifyToken = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const { ROLE } = require("../config/constants");

// Public: Get SEO data by slug
router.get("/page/:slug", seoController.getPageBySlug);

// Admin: CRUD for SEO pages
router.get("/pages", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN), seoController.getAllPages);
router.get("/page/id/:id", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN), seoController.getPageById);
router.post("/pages", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN), seoController.createPage);
router.put("/pages/:id", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN), seoController.updatePage);
router.delete("/pages/:id", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN), seoController.deletePage);

module.exports = router;
