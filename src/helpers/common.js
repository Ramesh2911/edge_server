const moment = require("moment");
const { v4: uuidv4 } = require("uuid");

/**
 * Generate UUID
 */
const generateUUID = () => {
    return uuidv4();
};

/**
 * Current Date Time
 */
const currentDateTime = () => {
    return moment().format("YYYY-MM-DD HH:mm:ss");
};

/**
 * Current Date
 */
const currentDate = () => {
    return moment().format("YYYY-MM-DD");
};

/**
 * Format Date
 */
const formatDate = (date, format = "YYYY-MM-DD") => {

    if (!date) return null;

    return moment(date).format(format);

};

/**
 * Generate Random Number
 */
const randomNumber = (length = 6) => {

    let number = "";

    for (let i = 0; i < length; i++) {

        number += Math.floor(Math.random() * 10);

    }

    return number;

};

/**
 * Slug Generator
 */
const slugify = (text = "") => {

    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

};

/**
 * Remove Null Values
 */
const removeNull = (obj) => {

    Object.keys(obj).forEach((key) => {

        if (
            obj[key] === null ||
            obj[key] === undefined ||
            obj[key] === ""
        ) {
            delete obj[key];
        }

    });

    return obj;

};

/**
 * Sleep Function
 */
const sleep = (ms) => {

    return new Promise(resolve => setTimeout(resolve, ms));

};

module.exports = {

    generateUUID,

    currentDateTime,

    currentDate,

    formatDate,

    randomNumber,

    slugify,

    removeNull,

    sleep

};