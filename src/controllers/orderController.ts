import { Response } from "express";
import { orderService } from "../services/orderService";
import { AuthRequest } from "../middleware/authMiddleware";
import { asyncHandler, AppError } from "../middleware/errorHandler";

export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { shippingAddress, paymentMethod } = req.body;
  const order = await orderService.create({
    userId: req.user?.id!,
    shippingAddress,
    paymentMethod,
  });
  res.status(201).json({ success: true, message: "Order placed successfully", data: order });
});

export const getUserOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit } = req.query;
  const result = await orderService.findByUserId(req.user?.id!, {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
  });
  res.json({ success: true, ...result });
});

export const getOrderById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.role === "admin" ? undefined : req.user?.id;
  const order = await orderService.findById(req.params.id as string, userId);
  if (!order) {
    throw new AppError("Order not found", 404);
  }
  res.json({ success: true, data: order });
});

export const getAllOrders = asyncHandler(async (req, res: Response) => {
  const { status, page, limit } = req.query;
  const result = await orderService.findAll({
    status: status ? String(status) : undefined,
    page: Number(page) || 1,
    limit: Number(limit) || 10,
  });
  res.json({ success: true, ...result });
});

export const updateOrderStatus = asyncHandler(async (req, res: Response) => {
  const { orderStatus, paymentStatus } = req.body;
  const order = await orderService.updateStatus(req.params.id as string, { orderStatus, paymentStatus });
  
  if (!order) {
    throw new AppError("Order not found", 404);
  }
  
  res.json({ success: true, message: "Order updated", data: order });
});

export const cancelOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const order = await orderService.cancel(req.params.id as string, req.user?.id!);
  
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  res.json({ success: true, message: "Order cancelled", data: order });
});

export const deleteOrder = asyncHandler(async (req, res: Response) => {
  const order = await orderService.softDelete(req.params.id as string);
  if (!order) {
    throw new AppError("Order not found", 404);
  }
  res.json({ success: true, message: "Order deleted (soft delete)" });
});

export const restoreOrder = asyncHandler(async (req, res: Response) => {
  const order = await orderService.restore(req.params.id as string);
  if (!order) {
    throw new AppError("Deleted order not found", 404);
  }
  res.json({ success: true, message: "Order restored", data: order });
});

export const updatePaymentStatus = asyncHandler(async (req, res: Response) => {
  const { paymentStatus } = req.body;
  const order = await orderService.updateStatus(req.params.id as string, { paymentStatus });
  
  if (!order) {
    throw new AppError("Order not found", 404);
  }
  
  res.json({ success: true, message: "Payment status updated", data: order });
});