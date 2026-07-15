const { body } = require("express-validator");

/**
 * Register Validation
 */
const registerValidation = [

    body("role_id")
        .notEmpty()
        .withMessage("Role is required")
        .isInt()
        .withMessage("Invalid role"),

    body("full_name")
        .trim()
        .notEmpty()
        .withMessage("Full Name is required")
        .isLength({ min: 3, max: 100 })
        .withMessage("Full Name should be between 3 to 100 characters"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid Email Address")
        .normalizeEmail(),

    body("mobile")
        .trim()
        .notEmpty()
        .withMessage("Mobile Number is required")
        .isLength({ min: 10, max: 15 })
        .withMessage("Invalid Mobile Number"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters")

];

/**
 * Login Validation
 */
const loginValidation = [
    // 1. If email is provided, validate its format
    body("email")
        .optional({ checkFalsy: true })
        .trim()
        .isEmail()
        .withMessage("Invalid Email Address"),

    // 2. If mobile is provided, validate its format
    body("mobile")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 10, max: 15 })
        .withMessage("Invalid Mobile Number")
        .matches(/^\d+$/)
        .withMessage("Mobile number must contain only digits"),

    // 3. Ensure at least one identifier is present
    body().custom((bodyFields) => {
        if (!bodyFields.email && !bodyFields.mobile) {
            throw new Error("Please provide either an Email or a Mobile number.");
        }
        return true;
    }),

    // 4. Password validation
    body("password")
        .notEmpty()
        .withMessage("Password is required")
];

// Helper functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidMobile(mobile) {
    const mobileRegex = /^\d{10,15}$/;
    return mobileRegex.test(mobile);
}

/**
 * Forgot Password
 */
const forgotPasswordValidation = [

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid Email Address")

];

/**
 * Reset Password
 */
const resetPasswordValidation = [

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be minimum 6 characters")

];

module.exports = {

    registerValidation,

    loginValidation,

    forgotPasswordValidation,

    resetPasswordValidation

};