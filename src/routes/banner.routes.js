const express = require("express");
const router = express.Router();
const bannerController = require("../controllers/banner.controller");
const verifyToken = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const { ROLE } = require("../config/constants");
const { bannerUpload } = require("../middleware/upload.middleware");

const adminOnly = roleMiddleware(ROLE.SUPER_ADMIN, ROLE.ADMIN_A, ROLE.ADMIN_B);

// Public — home hero slider
router.get("/", bannerController.list);

// Admin — manage dynamic banners
router.get("/admin", verifyToken, adminOnly, bannerController.listAll);
router.post("/", verifyToken, adminOnly, bannerUpload, bannerController.create);
router.put("/:id", verifyToken, adminOnly, bannerUpload, bannerController.update);
router.delete("/:id", verifyToken, adminOnly, bannerController.remove);

module.exports = router;
