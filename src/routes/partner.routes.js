const express = require("express");
const router = express.Router();
const partnerController = require("../controllers/partner.controller");
const verifyToken = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const { ROLE } = require("../config/constants");
const { partnerUpload } = require("../middleware/upload.middleware");

const adminOnly = roleMiddleware(ROLE.SUPER_ADMIN, ROLE.ADMIN_A, ROLE.ADMIN_B);

// Public — website/app home marquee
router.get("/", partnerController.list);

// Admin — manage dynamic developer logos (point 21)
router.get("/admin", verifyToken, adminOnly, partnerController.listAll);
router.post("/", verifyToken, adminOnly, partnerUpload, partnerController.create);
router.put("/:id", verifyToken, adminOnly, partnerUpload, partnerController.update);
router.delete("/:id", verifyToken, adminOnly, partnerController.remove);

module.exports = router;
