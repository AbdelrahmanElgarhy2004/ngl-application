import { Router } from "express";
import { authRouter } from "./app/auth/routes.js";
import { userRouter } from "./app/user/routes.js";
import { messageRouter } from "./app/message/routes.js";

export const router = Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/message', messageRouter);