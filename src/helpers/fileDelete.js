const fs = require("fs");

const path = require("path");

const deleteFile = (filePath) => {

    try {

        const fullPath = path.join(process.cwd(), filePath);

        if (fs.existsSync(fullPath)) {

            fs.unlinkSync(fullPath);

            return true;

        }

        return false;

    }

    catch (error) {

        console.log(error);

        return false;

    }

};

const deleteMultipleFiles = (files = []) => {

    files.forEach(file => {

        deleteFile(file);

    });

};

module.exports = {

    deleteFile,

    deleteMultipleFiles

};