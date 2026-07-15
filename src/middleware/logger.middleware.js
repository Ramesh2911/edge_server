const logger = require("../helpers/logger");

const loggerMiddleware = (req, res, next) => {

    const startTime = Date.now();

    res.on("finish", () => {

        const endTime = Date.now();

        const responseTime = endTime - startTime;

        logger.info(

            `${req.method} | ${req.originalUrl} | ${res.statusCode} | ${req.ip} | ${responseTime} ms`

        );

    });

    next();

};

module.exports = loggerMiddleware;