import { Response } from "express";
import jwt from "jsonwebtoken";
import { userService } from "../services/userService";
import { otpService } from "../services/otpService";
import { AuthRequest } from "../middleware/authMiddleware";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { sendOTPEmail } from "../utils/emailService";
import { generateOTP } from "../utils/otpUtils";
import { RefreshToken } from "../models/RefreshToken";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return secret;
};

const getJwtRefreshSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_REFRESH_SECRET is not defined in environment variables",
    );
  }
  return secret;
};

interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

const generateTokens = (user: {
  _id: { toString: () => string };
  email: string;
  role: string;
}) => {
  const payload: TokenPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, getJwtSecret(), { expiresIn: "15m" });
  const refreshToken = jwt.sign(payload, getJwtRefreshSecret(), {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

const sendTokens = (
  res: Response,
  accessToken: string,
  refreshToken: string,
) => {
  const isProduction = process.env.NODE_ENV === "production";

  const commonOptions: any = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/"
  };

  res.cookie("refreshToken", refreshToken, {
    ...commonOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie("accessToken", accessToken, {
    ...commonOptions,
    maxAge: 15 * 60 * 1000,
  });
};

const formatUser = (user: any) => ({
  id: user._id,
  fname: user.fname,
  lname: user.lname,
  email: user.email,
  role: user.role,
  isVerified: user.isEmailVerified,
});

export const register = asyncHandler(async (req, res: Response) => {
  const { fname, lname, email, password } = req.body;

  const exists = await userService.checkEmailExists(email);
  if (exists) {
    throw new AppError(
      "Email already in use. Please use a different email.",
      400,
    );
  }

  const user = await userService.create({ fname, lname, email, password });

  const otp = generateOTP();
  await otpService.createByUserId(
    user._id.toString(),
    otp,
    "email_verification",
  );
  await sendOTPEmail(email, otp, "email_verification");

  const { accessToken, refreshToken } = generateTokens(user);
  await RefreshToken.create({
    user: user._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  sendTokens(res, accessToken, refreshToken);

  res.status(201).json({
    success: true,
    message: "User registered successfully. Please verify your email.",
    accessToken,
    data: { user: formatUser(user) },
  });
});

export const login = asyncHandler(async (req, res: Response) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (user.isDeleted) {
    return res.status(403).json({
      success: false,
      message: "This account has been deleted. Please contact support.",
    });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid credentials" });
  }
  const { accessToken, refreshToken } = generateTokens(user);

  await RefreshToken.deleteMany({ user: user._id });

  await RefreshToken.create({
    user: user._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  sendTokens(res, accessToken, refreshToken);

  if (!user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: "Email is not verified. Please verify your email.",
    });
  }

  res.json({
    success: true,
    message: "Login successful",
    data: { user: formatUser(user) },
  });
});

export const refreshToken = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token found" });
    }

    const decoded = jwt.verify(
      refreshToken,
      getJwtRefreshSecret(),
    ) as TokenPayload;

    const storedToken = await RefreshToken.findOne({
      token: refreshToken,
      user: decoded.id,
    });
    if (!storedToken) {
      throw new AppError("Invalid refresh token", 401);
    }

    await RefreshToken.deleteMany({ user: decoded.id });

    const user = await userService.findById(decoded.id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const tokens = generateTokens(user);
    await RefreshToken.create({
      user: user._id,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    sendTokens(res, tokens.accessToken, tokens.refreshToken);

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: { accessToken: tokens.accessToken },
    });
  },
);

export const getProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await userService.findById(req.user?.id || "");
    if (!user) {
      throw new AppError("User not found", 404);
    }
    res.json({
      success: true,
      data: { user: formatUser(user) },
    });
  },
);

export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { fname, lname } = req.body;
    const user = await userService.update(req.user?.id!, { fname, lname });

    if (!user) {
      throw new AppError("User not found", 404);
    }
    res.json({
      success: true,
      message: "Profile updated",
      data: { user: formatUser(user) },
    });
  },
);

export const changePassword = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current password and new password",
      });
    }

    const user = await userService.findById(req.user?.id || "", true);
    // console.log();

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError("Current password is incorrect", 400);
    }

    await userService.updatePassword(req.user?.id!, newPassword);

    res.json({
      success: true,
      message: "Password changed successfully",
      data: null,
    });
  },
);

export const requestPasswordReset = asyncHandler(async (req, res: Response) => {
  const { email } = req.body;

  const user = await userService.findByEmail(email);
  if (!user) {
    throw new AppError("User not found with this email", 404);
  }

  await otpService.deleteByEmail(email, "password_reset");

  const otp = generateOTP();
  await otpService.create(email, otp, "password_reset");
  await sendOTPEmail(email, otp, "password_reset");

  res.json({ success: true, message: "OTP sent to your email", data: null });
});

export const verifyOTP = asyncHandler(async (req, res: Response) => {
  const { email, otp } = req.body;

  const otpRecord = await otpService.verify(email, otp, "password_reset");
  if (!otpRecord) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  const resetToken = jwt.sign({ email }, getJwtSecret(), { expiresIn: "15m" });

  res.json({
    success: true,
    message: "OTP verified successfully",
    data: { resetToken },
  });
});

export const resetPassword = asyncHandler(async (req, res: Response) => {
  const { resetToken, newPassword } = req.body;
  let decoded;
  try {
    decoded = jwt.verify(resetToken, getJwtSecret()) as { email: string };
  } catch (err) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  const user = await userService.findByEmail(decoded.email);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  await userService.updatePassword(user._id.toString(), newPassword);

  res.json({
    success: true,
    message: "Password reset successfully",
    data: null,
  });
});

export const verifyEmail = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { otp } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const otpRecord = await otpService.verifyByUserId(
      userId,
      otp,
      "email_verification",
    );
    if (!otpRecord) {
      throw new AppError("Invalid or expired OTP", 400);
    }

    await userService.update(userId, { isEmailVerified: true });
    await otpService.deleteByUserId(userId, "email_verification");

    const user = await userService.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.json({
      success: true,
      message: "Email verified successfully",
      data: { user: formatUser(user) },
    });
  },
);

export const resendVerificationOTP = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const user = await userService.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.isEmailVerified) {
      throw new AppError("Email already verified", 400);
    }

    await otpService.deleteByUserId(userId, "email_verification");

    const otp = generateOTP();
    await otpService.createByUserId(userId, otp, "email_verification");
    await sendOTPEmail(user.email, otp, "email_verification");

    res.json({
      success: true,
      message: "Verification OTP sent to your email",
      data: null,
    });
  },
);

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  const refreshToken = req.cookies?.refreshToken;

  if (token) {
    const decoded = jwt.verify(token, getJwtSecret()) as { id: string };
    await RefreshToken.deleteMany({ user: decoded.id });
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.json({ success: true, message: "Logged out successfully", data: null });
});
