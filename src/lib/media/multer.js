import multer, {diskStorage} from "multer";
import crypto from "crypto";
import {AppError} from "../error/error.js";

function multerUpload(allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif']) {
    return multer({
        fileFilter: (req, file, cb) => {

            if (!allowedTypes.includes(file.mimetype)) {
                return cb(new AppError('invalid file format', 400), false);
            }
            cb(null, true);
        },
        limits: {fileSize: 5 * 1024 * 1024},
        storage: diskStorage({
            destination: 'uploads', filename: (req, file, cb) => {
                cb(null, `${crypto.randomUUID()}-${file.originalname}`);
            }
        })
    });
}

export function uploadSingleFile(fieldName, allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif']) {
    return multerUpload(allowedTypes).single(fieldName);
}


export function uploadMultipleFiles(fieldName, maxCount) {
    return multerUpload().array(fieldName, maxCount);
}

export function uploadMultipleFields(fields) {
    return multerUpload().fields(fields)
}