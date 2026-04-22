import { Response } from "express";
import { categoryService } from "../services/categoryService";
import { asyncHandler, AppError } from "../middleware/errorHandler";

export const createCategory = asyncHandler(async (req, res: Response) => {
  const { name, description, image, parentCategory } = req.body;
  const category = await categoryService.create({ name, description, image, parentCategory });
  res.status(201).json({ success: true, message: "Category created", data: category });
});

export const getAllCategories = asyncHandler(async (req, res: Response) => {
  const { page, limit, search } = req.query;
  const result = await categoryService.findAll({
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    search: search ? String(search) : undefined,
  });
  res.json({ success: true, ...result });
});

export const getCategoryById = asyncHandler(async (req, res: Response) => {
  const category = await categoryService.findById(req.params.id as string);
  if (!category) {
    throw new AppError("Category not found", 404);
  }
  res.json({ success: true, data: category });
});

export const updateCategory = asyncHandler(async (req, res: Response) => {
  const category = await categoryService.update(req.params.id as string, req.body);
  if (!category) {
    throw new AppError("Category not found", 404);
  }
  res.json({ success: true, message: "Category updated", data: category });
});

export const deleteCategory = asyncHandler(async (req, res: Response) => {
  const category = await categoryService.softDelete(req.params.id as string);
  if (!category) {
    throw new AppError("Category not found", 404);
  }
  res.json({ success: true, message: "Category deleted (soft delete)" });
});

export const restoreCategory = asyncHandler(async (req, res: Response) => {
  const category = await categoryService.restore(req.params.id as string);
  if (!category) {
    throw new AppError("Deleted category not found", 404);
  }
  res.json({ success: true, message: "Category restored", data: category });
});