const authService = require("../services/auth.service");
const response = require("../helpers/response");
const { validationResult } = require("express-validator");


// Register
const register = async (req, res, next) => {

    try {

        const result = await authService.register(req.body);

        if (!result.success) {

            return response.error(

                res,

                result.message,

                result.status

            );

        }

        return response.success(

            res,

            result.message,

            result.data,

            result.status

        );

    }

    catch (error) {

        next(error);

    }

};

// Login
const login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response.error(
                res,
                errors.array()[0].msg,
                400
            );
        }

        const result = await authService.login(req.body);

        if (!result.success) {
            return response.error(
                res,
                result.message,
                result.status
            );
        }

        return response.success(
            res,
            result.message,
            result.data,
            result.status
        );

    } catch (error) {
        next(error);
    }

};

// Get Profile
const getProfile = async (req, res, next) => {

    try {

        const result = await authService.getProfile(

            req.user.id

        );

        if (!result.success) {

            return response.error(

                res,

                result.message,

                result.status

            );

        }

        return response.success(

            res,

            result.message,

            result.data,

            result.status

        );

    }

    catch (error) {

        next(error);

    }

};

// Update Profile
const updateProfile = async (req, res, next) => {

    try {

        const result = await authService.updateProfile(

            req.user.id,

            req.body,

            req.file

        );

        if (!result.success) {

            return response.error(

                res,

                result.message,

                result.status

            );

        }

        return response.success(

            res,

            result.message,

            result.data,

            result.status

        );

    }

    catch (error) {

        next(error);

    }

};

// Change Password
const changePassword = async (req, res, next) => {

    try {

        const result = await authService.changePassword(

            req.user.id,

            req.body

        );

        if (!result.success) {

            return response.error(

                res,

                result.message,

                result.status

            );

        }

        return response.success(

            res,

            result.message,

            {},

            result.status

        );

    }

    catch (error) {

        next(error);

    }

};

const logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        await authService.logoutUser(token);

        return response.success(res, "Logged out successfully.");
    } catch (error) {
        return response.error(res, error.message, 500);
    }
}


module.exports = {

    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    logout

};