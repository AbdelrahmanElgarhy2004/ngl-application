import { fileTypeFromBuffer } from "file-type";
import fs from "node:fs";
import { AppError } from "../error/error.js";

export const fileValidation = (allowedTypes = ['image/png', 'image/jpeg', 'image/gif']) => async (req, res, next) => {
    try {
        if (req.file.size > 20 * 1024 * 1024) {
            throw new AppError('exceeded file size', 400);
        }
        const filePath = req.file.path;
        const buffer = fs.readFileSync(filePath);
        const type = await fileTypeFromBuffer(buffer);


        if (!type || !allowedTypes.includes(type.mime)) {
            fs.unlinkSync(filePath);
            throw new AppError("Invalid file type", 400)
        }

        return next();
    } catch (error) {
        fs.unlinkSync(req.file.path);
        return next(error);
    }
};
