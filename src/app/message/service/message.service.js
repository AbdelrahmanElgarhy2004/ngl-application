import * as userRepository from '../../user/repository/user.repository.js'
import { UserNotExist } from "../../user/error.js";
import * as messageRepository from '../repository/message.repository.js'
import { mailjetProvider } from "../../../lib/email/init.js";

export async function sendMessage(content, receiver, sender) {
    // 1. check receiver exists
    const user = await userRepository.findUserById(receiver);
    if (!user) throw UserNotExist;
    // 2. save message into DBc
    const createdMessage = await messageRepository.createMessage(content, receiver, sender);
    // 3. notify receiver with email
    await mailjetProvider.sendMail(
        user.email,
        'new message from ngl ',
        '<h3>you have a new message</h3>'
    );
    return createdMessage;
}

export async function getMessages() {
}