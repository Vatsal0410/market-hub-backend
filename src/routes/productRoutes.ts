import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  restoreProduct,
} from "../controllers/productController";
import { authMiddleware } from "../middleware/authMiddleware";
import { adminMiddleware } from "../middleware/adminMiddleware";
import { validate } from "../middleware/validate";
import { createProductValidation, updateProductValidation } from "../validators/productValidator";

const router = Router();

router.post("/", authMiddleware, adminMiddleware, validate(createProductValidation), createProduct);

router.get("/", getAllProducts);

router.get("/:id", getProductById);

router.put("/:id", authMiddleware, adminMiddleware, validate(updateProductValidation), updateProduct);

router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

router.put("/:id/restore", authMiddleware, adminMiddleware, restoreProduct);

export default router;
