import {Message} from "../model/message.model.js";

export async function createMessage(content, receiver, sender) {
    return Message.create({
        content: content,
        receiver: receiver,
        sender: sender
    });
}