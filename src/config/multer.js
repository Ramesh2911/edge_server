const multer = require("multer");
const path = require("path");
const fs = require("fs");

const createFolder = (folder) => {

    if (!fs.existsSync(folder)) {

        fs.mkdirSync(folder, { recursive: true });

    }

};

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        let uploadPath = "uploads/temp";

        if (file.fieldname === "profile_image") {

            uploadPath = "uploads/profile";

        }

        if (file.fieldname === "property_images") {

            uploadPath = "uploads/property/images";

        }

        if (file.fieldname === "property_documents") {

            uploadPath = "uploads/property/documents";

        }

        if (file.fieldname === "banner_image") {

            uploadPath = "uploads/banner";

        }

        if (file.fieldname === "blog_image") {

            uploadPath = "uploads/blog";

        }

        createFolder(uploadPath);

        cb(null, uploadPath);

    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        cb(null, uniqueName);

    }

});

const fileFilter = (req, file, cb) => {

    const imageTypes = /jpg|jpeg|png|webp/;

    const documentTypes = /pdf|doc|docx/;

    const extension = path.extname(file.originalname).toLowerCase();

    if (
        imageTypes.test(extension) ||
        documentTypes.test(extension)
    ) {

        cb(null, true);

    } else {

        cb(new Error("Unsupported File Type"));

    }

};

const upload = multer({

    storage,

    limits: {

        fileSize: Number(process.env.MAX_FILE_SIZE)

    },

    fileFilter

});

module.exports = upload;