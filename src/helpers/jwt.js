// helpers/jwt.js

const jwt = require("jsonwebtoken");

const jwtConfig = require("../config/jwt");

/**
 * Generate Token
 */
const generateToken = (user) => {

    return jwt.sign(

        {

            id: user.id,

            role_id: user.role_id,

            email: user.email

        },

        jwtConfig.secret,

        {

            expiresIn: jwtConfig.expiresIn

        }

    );

};

/**
 * Verify Token
 */
const verifyToken = (token) => {

    try {

        return jwt.verify(

            token,

            jwtConfig.secret

        );

    } catch (error) {

        return null;

    }

};

/**
 * Decode Token
 */
const decodeToken = (token) => {

    return jwt.decode(token);

};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (user) => {

    return jwt.sign(

        {

            id: user.id

        },

        jwtConfig.secret,

        {

            expiresIn: "30d"

        }

    );

};

module.exports = {

    generateToken,

    verifyToken,

    decodeToken,

    generateRefreshToken

};