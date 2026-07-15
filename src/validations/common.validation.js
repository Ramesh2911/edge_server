const { body, param, query } = require("express-validator");

/**
 * ID Validation
 */

const idValidation = [

    param("id")
        .notEmpty()
        .withMessage("Id is required")
        .isInt()
        .withMessage("Invalid Id")

];

/**
 * Status Validation
 */

const statusValidation = [

    body("status")
        .notEmpty()
        .withMessage("Status is required")
        .isIn([0, 1])
        .withMessage("Invalid Status")

];

/**
 * Pagination Validation
 */

const paginationValidation = [

    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Invalid Page Number"),

    query("limit")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Invalid Limit")

];

/**
 * Search Validation
 */

const searchValidation = [

    query("search")
        .optional()
        .isLength({ max: 100 })
        .withMessage("Search should not exceed 100 characters")

];

module.exports = {

    idValidation,

    statusValidation,

    paginationValidation,

    searchValidation

};