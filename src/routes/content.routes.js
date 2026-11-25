const express = require("express");
const router = express.Router();
const contentController = require("../controllers/content.controller");
const verifyToken = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const { ROLE } = require("../config/constants");
const { galleryUpload } = require("../middleware/upload.middleware");

// Public: page content keys (about_*, contact_*) for the website
router.get("/", contentController.getPublicContent);

// Super Admin: update page content keys
router.put("/", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN), contentController.updateContent);

// Super Admin: About gallery image upload / delete (API-managed, no pasted URLs)
router.post(
    "/gallery-image",
    verifyToken,
    roleMiddleware(ROLE.SUPER_ADMIN),
    galleryUpload,
    contentController.uploadGallery
);
router.delete(
    "/gallery-image",
    verifyToken,
    roleMiddleware(ROLE.SUPER_ADMIN),
    contentController.deleteGalleryImage
);

module.exports = router;
