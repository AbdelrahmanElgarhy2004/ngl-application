// schema
import {model, Schema} from "mongoose";

const otpSchema = new Schema(
    {
        code: {
            type: String,
            required: true,
            length: 6
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        expiresAt: {
            type: Date,
            index: {expires: 0}
        }

    },
    {
        timestamps: {
            createdAt: true,
            updatedAt: false
        }
    }
);

otpSchema.pre('save', async function () {
    await OTP.deleteMany({
        email: this.email
    });
});

export const OTP = model('OTP', otpSchema);