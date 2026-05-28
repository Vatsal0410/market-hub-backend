import { Router, Request, Response } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  restoreProduct,
  uploadProductImage,
  deleteProductImage,
} from "../controllers/productController";
import { authMiddleware } from "../middleware/authMiddleware";
import { adminMiddleware } from "../middleware/adminMiddleware";
import { validate } from "../middleware/validate";
import { createProductValidation, updateProductValidation } from "../validators/productValidator";
import { uploadMultiple } from "../middleware/uploadMiddleware";

const router = Router();

router.post("/", authMiddleware, adminMiddleware, uploadMultiple, createProduct);

router.get("/", getAllProducts);

router.get("/:id", getProductById);

router.put("/:id", authMiddleware, adminMiddleware, uploadMultiple, updateProduct);

router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

router.put("/:id/restore", authMiddleware, adminMiddleware, restoreProduct);

router.post("/:id/images", authMiddleware, adminMiddleware, uploadMultiple, uploadProductImage);

router.delete("/:id/images/:filename", authMiddleware, adminMiddleware, deleteProductImage);

export default router;
