const { body } = require("express-validator");

/**
 * Update Profile
 */

const updateProfileValidation = [

    body("full_name")
        .trim()
        .notEmpty()
        .withMessage("Full Name is required")
        .isLength({ min: 3, max: 100 })
        .withMessage("Full Name should be between 3 to 100 characters"),

    body("mobile")
        .trim()
        .notEmpty()
        .withMessage("Mobile Number is required")
        .isLength({ min: 10, max: 15 })
        .withMessage("Invalid Mobile Number"),

    body("address")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Address should not exceed 500 characters"),

    body("city")
        .optional()
        .isLength({ max: 100 })
        .withMessage("City should not exceed 100 characters"),

    body("state")
        .optional()
        .isLength({ max: 100 })
        .withMessage("State should not exceed 100 characters"),

    body("country")
        .optional()
        .isLength({ max: 100 })
        .withMessage("Country should not exceed 100 characters"),

    body("pincode")
        .optional()
        .isLength({ min: 4, max: 10 })
        .withMessage("Invalid Pincode")

];

/**
 * Change Password
 */

const changePasswordValidation = [

    body("old_password")
        .notEmpty()
        .withMessage("Old Password is required"),

    body("new_password")
        .notEmpty()
        .withMessage("New Password is required")
        .isLength({ min: 6 })
        .withMessage("New Password must be minimum 6 characters")

];

module.exports = {

    updateProfileValidation,

    changePasswordValidation

};