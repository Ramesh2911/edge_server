const upload = require("../config/multer");
const response = require("../helpers/response");

/**
 * Property Upload
 */

const propertyUpload = (req, res, next) => {

    upload.fields([
        {
            name: "property_images",
            maxCount: 20
        },
        {
            name: "property_documents",
            maxCount: 10
        },
        {
            name: "floor_plan",
            maxCount: 1
        }
    ])(req, res, (err) => {

        if (err) {

            return response.error(
                res,
                err.message,
                400
            );

        }

        next();

    });

};

/**
 * Profile Upload
 */

const profileUpload = (req, res, next) => {

    upload.single("profile_image")(req, res, (err) => {

        if (err) {

            return response.error(
                res,
                err.message,
                400
            );

        }

        next();

    });

};

/**
 * Banner Upload
 */

const bannerUpload = (req, res, next) => {

    upload.single("banner_image")(req, res, (err) => {

        if (err) {

            return response.error(
                res,
                err.message,
                400
            );

        }

        next();

    });

};

/**
 * Blog Upload
 */

const blogUpload = (req, res, next) => {

    upload.single("blog_image")(req, res, (err) => {

        if (err) {

            return response.error(
                res,
                err.message,
                400
            );

        }

        next();

    });

};

module.exports = {

    propertyUpload,

    profileUpload,

    bannerUpload,

    blogUpload

};