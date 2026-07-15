const response = require("../helpers/response");
const logger = require("../helpers/logger");

const errorMiddleware = (

    err,

    req,

    res,

    next

) => {

    logger.error(

        `${req.method} ${req.originalUrl} : ${err.stack}`

    );

    if (err.name === "ValidationError") {

        return response.error(

            res,

            err.message,

            422

        );

    }

    if (err.code === "LIMIT_FILE_SIZE") {

        return response.error(

            res,

            "File size exceeds limit.",

            400

        );

    }

    if (err.code === "ER_DUP_ENTRY") {

        return response.error(

            res,

            "Duplicate record found.",

            409

        );

    }

    if (err.code === "ER_NO_REFERENCED_ROW_2") {

        return response.error(

            res,

            "Invalid reference data.",

            400

        );

    }

    if (err.code === "ENOENT") {

        return response.error(

            res,

            "File not found.",

            404

        );

    }

    return response.error(

        res,

        err.message || "Internal Server Error",

        err.statusCode || 500

    );

};

module.exports = errorMiddleware;