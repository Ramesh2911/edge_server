const { body } = require("express-validator");

const VISIT_STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled"];

const createVisitValidation = [
    body("propertyId").isInt({ min: 1 }).withMessage("Valid property ID is required"),
    body("visitDate").isISO8601().withMessage("Valid visit date is required"),
    body("visitTime").trim().notEmpty().withMessage("Visit time is required").isLength({ max: 10 }).withMessage("Visit time is too long"),
    body("notes").optional({ nullable: true }).isString().withMessage("Notes must be text")
];

const updateVisitStatusValidation = [
    body("status").isIn(VISIT_STATUSES).withMessage("Invalid visit status")
];

module.exports = { createVisitValidation, updateVisitStatusValidation };
