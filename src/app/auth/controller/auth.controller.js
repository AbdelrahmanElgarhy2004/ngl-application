import { validateBody } from "../../../lib/validation/validation.js";
import { toMs } from "../../../pkg/utils/time.js";
import { loginDTO, registerDTO, resetPasswordDTO, sendOtpDto, verifyAccountDTO } from "../dto/auth.dto.js";
import * as authService from '../service/auth.service.js';
import { setCookies } from '../utils.js';

export async function register(req, res, next) {
  try {
    const data = validateBody(registerDTO, req.body);
    const createdUser = await authService.register(data);
    res.json({
      message: "user created successfully", success: true, data: createdUser
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyAccount(req, res, next) {
  try {
    const data = validateBody(verifyAccountDTO, req.body);
    const { email, code } = data;
    await authService.verifyAccount(email, code);
    res.json({
      message: "user verify successfully", success: true,
    })
  } catch (error) {
    next(error);
  }
}


export async function sendOtp(req, res, next) {
  try {
    const data = validateBody(sendOtpDto, req.body);
    const { email } = data;
    await authService.sendOtp(email);
    res.json({
      message: "otp sent successfully, check your inbox", success: true,
    });
  } catch (error) {
    next(error);
  }
}

export async function enable2stepVerification(req, res, next) {
  try {
    const { email, code } = req.body;
    await authService.enable2stepVerification(email, code);
    res.json({ message: "enable 2 step verification successfully", success: true })
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const data = validateBody(loginDTO, req.body);
    const { email, password } = data
    const tokens = await authService.login(email, password);

    if (!tokens) {
      return res.json({ message: "check your inbox, we sent OTP", success: true });
    }
    setCookies(res, tokens.accessToken, tokens.refreshToken);
    res.json({
      message: "user login successfully", success: true,
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyCodeToLogin(req, res, next) {
  try {
    const { email, code } = req.body
    const { accessToken, refreshToken } = await authService.verifyCodeToLogin(email, code);
    setCookies(res, accessToken, refreshToken);
    res.json({ message: "login successfully", success: true });
  } catch (error) {
    next(error);
  }
}


export async function resetPassword(req, res, next) {
  try {
    const data = validateBody(resetPasswordDTO, req.body);
    res.json({
      message: "password reset successfully",
      success: true,
    });
    const { email, code, newPassword } = data;
    await authService.resetPassword(email, code, newPassword);
  } catch (error) {
    next(error);
  }
}


export async function loginWithGoogle(req, res, next) {
  try {
    const token = await authService.loginWithGoogle(req.body.idToken);
    res.cookie('access_token', token, {
      httpOnly: true,
      maxAge: toMs(1, 'hours'),
    });
    res.json({
      message: "user login successfully", success: true, data: token
    });
  } catch (error) {
    next(error);
  }
}


export async function refreshTokenFn(req, res, next) {
  try {

    const { accessToken, refreshToken } = await authService.refreshTokenFn(req.cookies.refresh_token);

    setCookies(res, accessToken, refreshToken);

    res.json({
      message: "refresh token successfully", success: true
    });
  } catch (error) {
    next(error)
  }
}
