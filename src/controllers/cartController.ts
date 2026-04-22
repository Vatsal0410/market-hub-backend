import { Response } from "express";
import { cartService } from "../services/cartService";
import { AuthRequest } from "../middleware/authMiddleware";
import { asyncHandler, AppError } from "../middleware/errorHandler";

export const getCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cart = await cartService.findByUserId(req.user?.id!);
  if (!cart) {
    return res.json({ success: true, data: { items: [], totalAmount: 0 } });
  }
  res.json({ success: true, data: cart });
});

export const getAllCarts = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const carts = await cartService.findAll();
  res.json({ success: true, data: carts });
});

export const getCartById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cart = await cartService.findById(req.params.id as string);
  if (!cart) {
    throw new AppError("Cart not found", 404);
  }
  res.json({ success: true, data: cart });
});

export const addToCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId, quantity } = req.body;
  const cart = await cartService.addItem(req.user?.id!, productId, quantity);
  res.status(201).json({ success: true, message: "Added to cart", data: cart });
});

export const updateCartItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { quantity } = req.body;
  const cart = await cartService.updateItemQuantity(req.user?.id!, req.params.productId as string, quantity);
  
  if (!cart) {
    throw new AppError("Item not found in cart", 404);
  }

  res.json({ success: true, message: "Cart updated", data: cart });
});

export const removeFromCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cart = await cartService.removeItem(req.user?.id!, req.params.productId as string);
  
  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  res.json({ success: true, message: "Item removed from cart", data: cart });
});

export const clearCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  await cartService.clearCart(req.user?.id!);
  res.json({ success: true, message: "Cart cleared" });
});