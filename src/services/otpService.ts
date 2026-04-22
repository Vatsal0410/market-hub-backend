import { OTP, IOTP } from "../models/OTP";
import { userService } from "./userService";

export const otpService = {
  async create(email: string, otp: string, type: "password_reset" | "email_verification"): Promise<IOTP> {
    await OTP.deleteMany({ email, type });
    
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    return OTP.create({ email, otp, expiresAt, type });
  },

  async createByUserId(userId: string, otp: string, type: "password_reset" | "email_verification"): Promise<IOTP> {
    const user = await userService.findById(userId);
    if (!user) throw new Error("User not found");
    
    await OTP.deleteMany({ userId, type });
    
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    return OTP.create({ email: user.email, userId, otp, expiresAt, type });
  },

  async verify(email: string, otp: string, type: "password_reset" | "email_verification"): Promise<IOTP | null> {
    const otpRecord = await OTP.findOne({ 
      email, 
      otp, 
      type,
      isUsed: false,
    });

    if (!otpRecord) return null;
    if (new Date() > otpRecord.expiresAt) return null;

    otpRecord.isUsed = true;
    await otpRecord.save();

    return otpRecord;
  },

  async verifyByUserId(userId: string, otp: string, type: "password_reset" | "email_verification"): Promise<IOTP | null> {
    const otpRecord = await OTP.findOne({ 
      userId, 
      otp, 
      type,
      isUsed: false,
    });

    if (!otpRecord) return null;
    if (new Date() > otpRecord.expiresAt) return null;

    otpRecord.isUsed = true;
    await otpRecord.save();

    return otpRecord;
  },

  async deleteByEmail(email: string, type: string): Promise<void> {
    await OTP.deleteMany({ email, type });
  },

  async deleteByUserId(userId: string, type: string): Promise<void> {
    await OTP.deleteMany({ userId, type });
  },
};