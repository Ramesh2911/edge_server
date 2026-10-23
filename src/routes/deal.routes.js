const express = require("express");
const router = express.Router();
const dealController = require("../controllers/deal.controller");
const dealValidation = require("../validations/deal.validation");
const validate = require("../middleware/validation.middleware");
const verifyToken = require("../middleware/auth.middleware");

router.get("/", verifyToken, dealController.getDeals);
router.post("/", verifyToken, dealValidation.createDealValidation, validate, dealController.createDeal);
router.patch("/:id/status", verifyToken, dealValidation.updateDealStageValidation, validate, dealController.updateDealStage);
router.delete("/:id", verifyToken, dealController.removeDeal);

module.exports = router;
