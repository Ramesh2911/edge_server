const response = require("../helpers/response");
const jwtHelper = require("../helpers/jwt");

const authMiddleware = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {

            return response.error(
                res,
                "Authorization token is required.",
                401
            );

        }

        if (!authHeader.startsWith("Bearer ")) {

            return response.error(
                res,
                "Invalid authorization format.",
                401
            );

        }

        const token = authHeader.split(" ")[1];

        const decoded = jwtHelper.verifyToken(token);

        if (!decoded) {

            return response.error(
                res,
                "Invalid or expired token.",
                401
            );

        }

        req.user = decoded;

        next();

    } catch (error) {

        return response.error(
            res,
            "Unauthorized",
            401
        );

    }

};

module.exports = authMiddleware;