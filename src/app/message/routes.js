import {Router} from "express";
import * as messageController from "./controller/message.controller.js";
import {authGuard} from "../../lib/auth/guard.js";

export const messageRouter = Router();

messageRouter.post('/', messageController.sendMessage);
messageRouter.post('/public', authGuard, messageController.sendMessage);
