import { cacheProvider } from '../../../lib/cache/init.js';
import { mailjetProvider } from "../../../lib/email/init.js";
import { AppError } from '../../../lib/error/error.js';
import { generateOTP } from "../../../lib/utils/otp.js";
import { logger } from "../../../pkg/logger/logger.js";
import { toMs, toSeconds } from "../../../pkg/utils/time.js";
import { UserAlreadyExists, UserNotExist, UserNotVerified } from "../../user/error.js";
import * as userRepository from "../../user/repository/user.repository.js";
import { ExpiredOtp, InvalidOtp, InvalidPassword } from "../error.js";
import * as authRepository from '../repository/auth.repository.js';
import { comparePassword, generateAccessToken, generateRefreshToken, hashPassword, verifyGoogleToken, verifyRefreshToken } from "../utils.js";

export async function baseFunction(email, code, factory) {
  // 1. check user existence
  const user = await userRepository.checkUserExistByEmail(email);
  // 1.1 handle user not found
  if (!user) throw UserNotExist;
  // 2. check otp:
  // const otp = await otpRepository.getOTPByEmail(email);
  const otp = await cacheProvider.get(`otp:${email}`);
  // 2.1 handle if email does not have any OTPs.
  if (!otp) throw ExpiredOtp;
  // 2.2 handle if incorrect code
  if (otp !== code) throw InvalidOtp;
  // 3. switch isVerified to true >> update user
  const result = await factory(user);
  //delete otp from cache
  await cacheProvider.del(`otp:${email}`);
  return result;
}

export async function register(userData) {
  // 1. check user existence
  const user = await userRepository.checkUserExistByEmail(userData.email);
  logger.debug('user exist', { user });
  if (user) throw UserAlreadyExists;

  // 2. prepare data [hash-password]
  userData.password = await hashPassword(userData.password);
  // 3. save user into DB.
  const createdUser = await authRepository.createUser(userData);
  // 4. generate otp and save it into DB
  const code = generateOTP();
  await cacheProvider.set(`otp:${email}`, code, toSeconds(3, 'minutes'));
  // 5. send otp in email
  await mailjetProvider.sendMail(
    userData.email,
    'otp verification',
    `<h1>your otp to verify your account is ${code}</h1>`
  );

  return createdUser;
}

export async function verifyAccount(email, code) {
  await baseFunction(email, code, async () => {
    await userRepository.updateUser(email, { isVerified: true });
  });
}

export async function enable2stepVerification(email, code) {
  await baseFunction(email, code, async () => {
    await userRepository.updateUser(email, { twoStepVerification: true });
  });
}

export async function verifyCodeToLogin(email, code) {

  const { accessToken, refreshToken } = await baseFunction(email, code, async (user) => {
    const jti = crypto.randomUUID();
    const accessToken = generateAccessToken({ sub: user._id, name: user.name });
    const refreshToken = generateRefreshToken({ jti: jti, sub: user._id, name: user.name });
    await cacheProvider.set(`refreshToken:${jti}`, jti, toSeconds(7, 'days'));
    return {
      accessToken,
      refreshToken
    }
  });

  return { accessToken, refreshToken };

}


export async function sendOtp(email) {
  // 1. check user existence
  const user = await userRepository.checkUserExistByEmail(email);
  if (!user) throw UserNotExist;
  const code = generateOTP();
  await cacheProvider.set(`otp:${email}`, code, toMs(3, 'minutes'));
  // 4. send otp into email
  await mailjetProvider.sendMail(user.email, 'new OTP', `<h1>Your new OTP is ${code}</h1>`)
}

export async function login(email, password) {
  let cachedTries = await cacheProvider.get(`login-tries:${email}`);
  if (cachedTries === '0') throw new AppError('Too Many Requests To Login', 429);

  // 1. check user existence.
  const user = await userRepository.checkUserExistByEmail(email);
  if (!user) throw UserNotExist;
  if (user.isVerified === false) throw UserNotVerified;

  // 2. compare password.
  const match = await comparePassword(password, user.password);
  if (!match) throw InvalidPassword;


  if (user.twoStepVerification == true) {
    const code = generateOTP();
    cacheProvider.set(`otp:${email}`, code, toSeconds(3, 'minutes'));
    await mailjetProvider.sendMail(email, '2 step verification email code', `<h3> Your OTP to Login is ${code}</h3>`)
    return;
  }
  // 3. generate token.
  const jti = crypto.randomUUID()
  const accessToken = generateAccessToken({ sub: user._id, name: user.name });
  const refreshToken = generateRefreshToken({ jti: jti, sub: user._id, name: user.name });
  await cacheProvider.set(`refreshToken:${jti}`, jti, toSeconds(7, 'days'));

  // set into cache >> 4 tries
  let cachedTTL = await cacheProvider.ttl(`login-tries:${email}`);
  cachedTries = cachedTries ?? 4;
  const ttl = cachedTTL == -2 ? toSeconds(3, 'minutes') : cachedTTL;
  await cacheProvider.set(`login-tries:${email}`, cachedTries - 1, ttl);

  return {
    accessToken,
    refreshToken
  }
}

export async function resetPassword(email, code, newPassword) {
  // get user data
  const user = await userRepository.checkUserExistByEmail(email);
  // 1. verify otp code
  const otp = await cacheProvider.get(`otp:${user.id}`);
  if (!otp) throw ExpiredOtp;
  if (otp !== code) throw InvalidOtp;
  // 2. hash-password
  const hashedPassword = await hashPassword(newPassword);
  // 3. update user password
  await userRepository.updateUser(email, { password: hashedPassword });
  // 4. delete otp after use
  await cacheProvider.del(`otp:${user.id}`);
}


export async function loginWithGoogle(idToken) {
  // 1. verify token come from Google
  const payload = await verifyGoogleToken(idToken);
  // 2. check user exists
  const user = await userRepository.checkUserExistByEmail(payload.email);
  // 3. if exists >> generate token
  if (user) {
    return generateAccessToken({
      id: user._id,
      email: user.email
    });
  }
  // 4. if not exists >> create user >> generate token
  const createdUser = await authRepository.createUser({
    name: payload.name,
    email: payload.email,
    provider: 'google',
    isVerified: true,
  });
  return generateAccessToken({
    id: createdUser._id,
    email: createdUser.email
  });
}

export async function refreshTokenFn(token) {
  // 1. verify refresh token
  const payload = verifyRefreshToken(token);
  // 2. token used before
  const tokenId = await cacheProvider.get(`refreshToken:${payload.jti}`);
  if (!tokenId) throw new AppError('Used refresh token', 400);

  // 2. generate access token
  const jti = crypto.randomUUID();

  const accessToken = generateAccessToken({ id: payload.id, name: payload.name });
  // 3. generate refresh token
  const refreshToken = generateRefreshToken({ jti: jti, id: payload.id, name: payload.name });

  await cacheProvider.del(`refreshToken:${tokenId}`);
  await cacheProvider.set(`refreshToken:${jti}`, jti, toSeconds(7, 'days'));

  return {
    accessToken,
    refreshToken
  }
}
