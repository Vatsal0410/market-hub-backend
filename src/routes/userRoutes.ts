import { Router } from "express";
import { getAllUsers, getUserById, updateUser, deleteUser, restoreUser } from "../controllers/userController";
import { authMiddleware } from "../middleware/authMiddleware";
import { adminMiddleware } from "../middleware/adminMiddleware";
import { validate } from "../middleware/validate";
import { updateUserValidation } from "../validators/userValidator";

const router = Router();

router.get("/", authMiddleware, adminMiddleware, getAllUsers);

router.get("/:id", authMiddleware, adminMiddleware, getUserById);

router.put("/:id", authMiddleware, adminMiddleware, validate(updateUserValidation), updateUser);

router.delete("/:id", authMiddleware, adminMiddleware, deleteUser);

router.put("/:id/restore", authMiddleware, adminMiddleware, restoreUser);

export default router;