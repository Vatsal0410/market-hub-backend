import { Router } from "express";
import { register, login, refreshToken, getProfile, updateProfile, changePassword, requestPasswordReset, verifyOTP, resetPassword, verifyEmail, resendVerificationOTP, logout } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import { validate } from "../middleware/validate";
import { registerValidation, loginValidation, changePasswordValidation, updateProfileValidation, forgotPasswordValidation, verifyOTPValidation, resetPasswordValidation, verifyEmailValidation } from "../validators/authValidator";
import { authLimiter, loginLimiter, otpLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/register", authLimiter, validate(registerValidation), register);

router.post("/login", loginLimiter, validate(loginValidation), login);

router.post("/refresh-token", authLimiter, refreshToken);

router.get("/profile", authMiddleware, getProfile);

router.put("/profile", authMiddleware, validate(updateProfileValidation), updateProfile);

router.put("/password", authMiddleware, validate(changePasswordValidation), changePassword);

router.post("/verify-email", authMiddleware, authLimiter, validate(verifyEmailValidation), verifyEmail);

router.post("/resend-verification", authMiddleware, authLimiter, otpLimiter, resendVerificationOTP);

router.post("/forgot-password", otpLimiter, validate(forgotPasswordValidation), requestPasswordReset);

router.post("/verify-otp", otpLimiter, validate(verifyOTPValidation), verifyOTP);

router.post("/reset-password", authLimiter, validate(resetPasswordValidation), resetPassword);

router.post("/logout", authMiddleware, logout);

export default router;
