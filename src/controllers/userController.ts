import { Response } from "express";
import { userService } from "../services/userService";
import { AuthRequest } from "../middleware/authMiddleware";
import { asyncHandler, AppError } from "../middleware/errorHandler";

export const getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;

  const result = await userService.findAll({ page, limit, search });
  res.json({ success: true, data: result });
});

export const getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.params.id as string;
  const user = await userService.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  res.json({ success: true, data: user });
});

export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { fname, lname, role, isEmailVerified } = req.body;
  const userId = req.params.id as string;
  const user = await userService.updateById(userId, { fname, lname, role, isEmailVerified });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  res.json({ success: true, message: "User updated", data: user });
});

export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.params.id as string;
  const user = await userService.softDelete(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  res.json({ success: true, message: "User deleted" });
});

export const restoreUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.params.id as string;
  const user = await userService.restore(userId);
  if (!user) {
    throw new AppError("Deleted user not found", 404);
  }
  res.json({ success: true, message: "User restored", data: user });
});