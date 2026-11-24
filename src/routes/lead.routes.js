const express = require("express");
const router = express.Router();
const leadController = require("../controllers/lead.controller");
const verifyToken = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const { ROLE } = require("../config/constants");

// Public: Anyone can submit a buyer requirement (lead pop-up) without login
router.post("/requirements", leadController.createRequirement);

// Authenticated: Users can view/edit their own requirements
router.get("/requirements", verifyToken, leadController.getRequirements);
router.get("/requirements/:id", verifyToken, leadController.getRequirementById);
router.put("/requirements/:id", verifyToken, leadController.updateRequirement);
router.delete("/requirements/:id", verifyToken, leadController.deleteRequirement);

// Super Admin: View all interests/pokes with buyer+seller details
router.get("/interests", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN, ROLE.ADMIN_A, ROLE.ADMIN_B), leadController.getAllInterests);

// Newsletter subscribers (point 17) — public subscribe, admin manage
router.post("/newsletter", leadController.subscribeNewsletter);
router.get("/newsletter", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN, ROLE.ADMIN_A, ROLE.ADMIN_B), leadController.getNewsletterSubscribers);
router.delete("/newsletter/:id", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN, ROLE.ADMIN_A, ROLE.ADMIN_B), leadController.deleteNewsletterSubscriber);

// All leads in one feed — ?view=account|property (point 17)
router.get("/all", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN, ROLE.ADMIN_A, ROLE.ADMIN_B), leadController.getAllLeads);

module.exports = router;
