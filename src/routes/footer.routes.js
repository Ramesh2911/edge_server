const express = require("express");
const router = express.Router();
const footerController = require("../controllers/footer.controller");
const verifyToken = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const { ROLE } = require("../config/constants");

// Public: footer for website (contact + useful links)
router.get("/", footerController.getFooter);
// Public: content page for a footer menu item (by url slug)
router.get("/links/page/:slug", footerController.getLinkContent);

// Admin (Super Admin): contact + useful links management
router.get("/contact", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN), footerController.getContact);
router.put("/contact", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN), footerController.updateContact);
router.get("/links", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN), footerController.getAllLinks);
router.post("/links", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN), footerController.createLink);
router.put("/links/:id", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN), footerController.updateLink);
router.delete("/links/:id", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN), footerController.deleteLink);

module.exports = router;
