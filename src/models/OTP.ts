import { Schema, model, Document, Types } from "mongoose";

export interface IOTP extends Document {
  email: string;
  userId?: Types.ObjectId;
  otp: string;
  expiresAt: Date;
  isUsed: boolean;
  type: "password_reset" | "email_verification";
}

const otpSchema = new Schema<IOTP>(
  {
    email: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    isUsed: { type: Boolean, default: false },
    type: { 
      type: String, 
      enum: ["password_reset", "email_verification"], 
      default: "password_reset" 
    },
  },
  { timestamps: true, versionKey: false }
);

otpSchema.index({ email: 1, otp: 1 });
otpSchema.index({ userId: 1, otp: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTP = model<IOTP>("OTP", otpSchema);