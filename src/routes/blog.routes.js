const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blog.controller");
const verifyToken = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const { ROLE } = require("../config/constants");

// Admin (Super Admin): manage posts — registered before /:slug
router.get("/all", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN), blogController.getAll);
router.post("/", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN), blogController.create);
router.put("/:id", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN), blogController.update);
router.delete("/:id", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN), blogController.delete);

// Public: website home blog section
router.get("/", blogController.getPublicPosts);
router.get("/:slug", blogController.getPublicPost);

module.exports = router;
