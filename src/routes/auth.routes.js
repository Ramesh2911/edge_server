const express = require("express");

const router = express.Router();

const authController = require("../controllers/auth.controller");

const authValidation = require("../validations/auth.validation");

const userValidation = require("../validations/user.validation");

const validate = require("../middleware/validation.middleware");

const auth = require("../middleware/auth.middleware");

const upload = require("../middleware/upload.middleware");

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.post(

    "/register",

    authValidation.registerValidation,

    validate,

    authController.register

);

router.post(

    "/login",

    authValidation.loginValidation,

    validate,

    authController.login

);

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

router.get(

    "/profile",

    auth,

    authController.getProfile

);

router.put(

    "/update-profile",

    auth,

    upload.profileUpload,

    userValidation.updateProfileValidation,

    validate,

    authController.updateProfile

);

router.put(

    "/change-password",

    auth,

    userValidation.changePasswordValidation,

    validate,

    authController.changePassword

);

router.post("/logout", auth, authController.logout);

module.exports = router;