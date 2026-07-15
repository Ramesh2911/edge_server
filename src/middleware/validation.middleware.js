const { validationResult } = require("express-validator");

const response = require("../helpers/response");

const validate = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        return response.error(

            res,

            "Validation Failed",

            422,

            errors.array()

        );

    }

    next();

};

module.exports = validate;