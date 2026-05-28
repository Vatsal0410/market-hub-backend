import { Response, Request } from "express";
import { productService } from "../services/productService";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { IProductImage } from "../models/Product";

interface MulterRequest extends Request {
  files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
}

export const createProduct = asyncHandler(async (req: MulterRequest, res: Response) => {
  const { name, description, price, category, stock, unit, isAvailable } = req.body;

  let images: IProductImage[] = [];

  if (req.files && Array.isArray(req.files)) {
    images = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      path: `/uploads/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size,
    }));
  } else if (req.body.images) {
    try {
      images = typeof req.body.images === "string" ? JSON.parse(req.body.images) : req.body.images;
    } catch {
      images = [];
    }
  }

  const product = await productService.create({
    name,
    description,
    price: Number(price),
    images,
    category,
    stock: Number(stock),
    unit,
    isAvailable: isAvailable === "true" || isAvailable === true,
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

export const updateProduct = asyncHandler(async (req: MulterRequest, res: Response) => {
  const { name, description, price, category, stock, unit, isAvailable } = req.body;

  const updateData: Record<string, unknown> = { ...req.body };

  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const newImages = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      path: `/uploads/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size,
    }));

    const existingImages = req.body.images ? JSON.parse(req.body.images as string) : [];
    updateData.images = [...(existingImages as IProductImage[]), ...newImages];
  }

  if (price) updateData.price = Number(price);
  if (stock) updateData.stock = Number(stock);
  if (isAvailable !== undefined) updateData.isAvailable = isAvailable === "true" || isAvailable === true;

  const product = await productService.update(req.params.id as string, updateData);
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

export const uploadProductImage = asyncHandler(async (req: MulterRequest, res: Response) => {
  const product = await productService.findById(req.params.id as string);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new AppError("No files uploaded", 400);
  }

  const newImages = req.files.map((file) => ({
    filename: file.filename,
    originalName: file.originalname,
    path: `/uploads/${file.filename}`,
    mimetype: file.mimetype,
    size: file.size,
  }));

  const updatedProduct = await productService.addImages(req.params.id as string, newImages);
  res.status(201).json({ success: true, message: "Images uploaded", data: updatedProduct });
});

export const deleteProductImage = asyncHandler(async (req, res: Response) => {
  const id = req.params.id as string;
  const filename = req.params.filename as string;
  const product = await productService.findById(id);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const fs = await import("fs");
  const path = await import("path");
  const filePath = path.join(__dirname, "..", "..", "uploads", filename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  const updatedProduct = await productService.removeImage(id, filename);
  res.json({ success: true, message: "Image deleted", data: updatedProduct });
});