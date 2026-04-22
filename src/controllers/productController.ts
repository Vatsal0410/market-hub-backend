import { Response } from "express";
import { productService } from "../services/productService";
import { asyncHandler, AppError } from "../middleware/errorHandler";

export const createProduct = asyncHandler(async (req, res: Response) => {
  const { name, description, price, images, category, stock, unit, isAvailable } = req.body;
  const product = await productService.create({
    name, description, price, images, category, stock, unit, isAvailable
  });
  res.status(201).json({ success: true, message: "Product created", data: product });
});

export const getAllProducts = asyncHandler(async (req, res: Response) => {
  const { category, search, minPrice, maxPrice, page, limit } = req.query;
  const result = await productService.findAll({
    category: category ? String(category) : undefined,
    search: search ? String(search) : undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    page: Number(page) || 1,
    limit: Number(limit) || 10,
  });
  res.json({ success: true, ...result });
});

export const getProductById = asyncHandler(async (req, res: Response) => {
  const product = await productService.findById(req.params.id as string);
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  res.json({ success: true, data: product });
});

export const updateProduct = asyncHandler(async (req, res: Response) => {
  const product = await productService.update(req.params.id as string, req.body);
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  res.json({ success: true, message: "Product updated", data: product });
});

export const deleteProduct = asyncHandler(async (req, res: Response) => {
  const product = await productService.softDelete(req.params.id as string);
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  res.json({ success: true, message: "Product deleted (soft delete)" });
});

export const restoreProduct = asyncHandler(async (req, res: Response) => {
  const product = await productService.restore(req.params.id as string);
  if (!product) {
    throw new AppError("Deleted product not found", 404);
  }
  res.json({ success: true, message: "Product restored", data: product });
});