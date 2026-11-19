import {OTP} from "../model/otp.model.js";

export async function createOtp(otpData) {
    return OTP.create(otpData);
}

export async function getOTPByEmail(email) {
    return OTP.findOne({
        email: email
    })
}


export async function deleteOtp(email) {
    return OTP.deleteMany({
        email: email
    });
}