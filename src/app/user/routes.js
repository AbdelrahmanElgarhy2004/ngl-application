import { Router } from "express";
import fs from "node:fs";
import { authGuard } from "../../lib/auth/guard.js";
import { withCache } from "../../lib/cache/withCache.js";
import { fileValidation } from "../../lib/media/file.validation.js";
import { uploadMultipleFields, uploadMultipleFiles, uploadSingleFile } from "../../lib/media/multer.js";
import { User } from "./model/user.model.js";
import * as userRepository from './repository/user.repository.js';

export const userRouter = Router();

userRouter.get('/get-all-users',
  withCache(),
  async (req, res, next) => {
    const users = await User.find();
    let ka3bora = 'ka3bora';
    console.log(ka3bora);
    res.json(users);
  }
)


userRouter.post('/upload-profile-pic',
  authGuard,
  uploadSingleFile('pp'),
  fileValidation(),
  async (req, res, next) => {
    const user = await userRepository.findUserById(req.user.id);
    if (user.profilePicPath) {
      fs.unlinkSync(user.profilePicPath);
    }

    await userRepository.updateUser(user.email, { $set: { profilePicPath: req.file.path } });
    res.json('ok');
  }
);


userRouter.post('/upload-cv', uploadSingleFile('cv'), (req, res, next) => {
  res.json('ok');
});


userRouter.post('/upload-cover-images',
  uploadMultipleFiles('cover-images', 5),
  (req, res, next) => {
    console.log(req.files);
    res.json('ok');
  }
);

userRouter.post('/upload-all-files',
  uploadMultipleFields([
    { name: "cover-images", maxCount: 5 },
    { name: "cv", maxCount: 1 },
    { name: "pp", maxCount: 1 },
    { name: "licences", maxCount: 2 },
  ]),
  (req, res, next) => {
    console.log(req.files);
    res.json('ok');
  }
);