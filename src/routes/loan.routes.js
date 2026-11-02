const express = require("express");
const router = express.Router();
const loanController = require("../controllers/loan.controller");
const verifyToken = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const { ROLE } = require("../config/constants");

// Public: anyone can submit a loan application from the website
router.post("/", loanController.create);

// Admin: view-only list of all loan applications
router.get("/", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN, ROLE.ADMIN_A, ROLE.ADMIN_B), loanController.getAll);

module.exports = router;
