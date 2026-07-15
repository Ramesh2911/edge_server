const fs = require("fs");
const path = require("path");
const moment = require("moment");

const logDirectory = path.join(__dirname, "../../logs");

if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

const writeLog = (fileName, message) => {

    const filePath = path.join(logDirectory, fileName);

    const logMessage =
        `[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${message}\n`;

    fs.appendFile(filePath, logMessage, (err) => {

        if (err) {

            console.error("Logger Error :", err);

        }

    });

};

const info = (message) => {

    writeLog("access.log", message);

};

const error = (message) => {

    writeLog("error.log", message);

};

const warning = (message) => {

    writeLog("warning.log", message);

};

module.exports = {

    info,

    warning,

    error

};