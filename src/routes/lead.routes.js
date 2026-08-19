const express = require("express");
const router = express.Router();
const leadController = require("../controllers/lead.controller");
const verifyToken = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const { ROLE } = require("../config/constants");

// Public: Anyone can submit a buyer requirement (lead pop-up)
router.post("/requirements", verifyToken, leadController.createRequirement);

// Authenticated: Users can view/edit their own requirements
router.get("/requirements", verifyToken, leadController.getRequirements);
router.get("/requirements/:id", verifyToken, leadController.getRequirementById);
router.put("/requirements/:id", verifyToken, leadController.updateRequirement);
router.delete("/requirements/:id", verifyToken, leadController.deleteRequirement);

// Super Admin: View all interests/pokes with buyer+seller details
router.get("/interests", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN, ROLE.ADMIN_A, ROLE.ADMIN_B), leadController.getAllInterests);

module.exports = router;
