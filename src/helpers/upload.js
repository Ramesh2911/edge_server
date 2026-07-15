// helpers/upload.js

const path = require("path");

const fs = require("fs");

const BASE_URL = process.env.BASE_URL;

const imageUrl = (folder, fileName) => {

    if (!fileName) {

        return null;

    }

    return `${BASE_URL}/uploads/${folder}/${fileName}`;

};

const propertyImage = (fileName) => {

    return imageUrl(

        "property/images",

        fileName

    );

};

const propertyDocument = (fileName) => {

    return imageUrl(

        "property/documents",

        fileName

    );

};

const profileImage = (fileName) => {

    return imageUrl(

        "profile",

        fileName

    );

};

const bannerImage = (fileName) => {

    return imageUrl(

        "banner",

        fileName

    );

};

const blogImage = (fileName) => {

    return imageUrl(

        "blog",

        fileName

    );

};

const fileExists = (filePath) => {

    return fs.existsSync(filePath);

};

const getExtension = (fileName) => {

    return path.extname(fileName);

};

module.exports = {

    propertyImage,

    propertyDocument,

    profileImage,

    bannerImage,

    blogImage,

    fileExists,

    getExtension

};