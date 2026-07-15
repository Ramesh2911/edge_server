const response = require("../helpers/response");

const roleMiddleware = (...allowedRoles) => {

    return (req, res, next) => {

        try {

            if (!req.user) {

                return response.error(
                    res,
                    "Unauthorized",
                    401
                );

            }

            if (!allowedRoles.includes(req.user.role_id)) {

                return response.error(
                    res,
                    "Permission denied.",
                    403
                );

            }

            next();

        } catch (error) {

            return response.error(
                res,
                "Access denied.",
                403
            );

        }

    };

};

module.exports = roleMiddleware;