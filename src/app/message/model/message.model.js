import {model, Schema} from "mongoose";

const messageSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
            minlength: 1,
            maxlength: 200,
            trim: true
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        receiver: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: {
            createdAt: true,
            updatedAt: true
        }
    }
)

export const Message = model('Message', messageSchema)