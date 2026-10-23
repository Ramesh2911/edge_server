const { body } = require("express-validator");

const DEAL_STAGES = ["initial", "offer", "negotiation", "closed"];

const createDealValidation = [
    body("propertyId").isInt({ min: 1 }).withMessage("Valid property ID is required"),
    body("buyerName").trim().notEmpty().withMessage("Buyer name is required").isLength({ max: 100 }).withMessage("Buyer name is too long"),
    body("buyerPhone").optional({ nullable: true }).trim().isLength({ max: 20 }).withMessage("Buyer phone is too long"),
    body("dealValue").isFloat({ gt: 0 }).withMessage("Deal value must be greater than 0"),
    body("stage").optional().isIn(DEAL_STAGES).withMessage("Invalid deal stage"),
    body("notes").optional({ nullable: true }).isString().withMessage("Notes must be text")
];

const updateDealStageValidation = [
    body("stage").isIn(DEAL_STAGES).withMessage("Invalid deal stage")
];

module.exports = { createDealValidation, updateDealStageValidation };
