import { Router } from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  restoreCategory,
} from "../controllers/categoryController";
import { authMiddleware } from "../middleware/authMiddleware";
import { adminMiddleware } from "../middleware/adminMiddleware";
import { validate } from "../middleware/validate";
import { createCategoryValidation, updateCategoryValidation } from "../validators/categoryValidator";

const router = Router();

router.post("/", authMiddleware, adminMiddleware, validate(createCategoryValidation), createCategory);

router.get("/", getAllCategories);

router.get("/:id", getCategoryById);

router.put("/:id", authMiddleware, adminMiddleware, validate(updateCategoryValidation), updateCategory);

router.delete("/:id", authMiddleware, adminMiddleware, deleteCategory);

router.put("/:id/restore", authMiddleware, adminMiddleware, restoreCategory);

export default router;
