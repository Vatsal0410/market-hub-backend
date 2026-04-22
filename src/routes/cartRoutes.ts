import { Router } from "express";
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart, getAllCarts, getCartById } from "../controllers/cartController";
import { authMiddleware } from "../middleware/authMiddleware";
import { adminMiddleware } from "../middleware/adminMiddleware";
import { validate } from "../middleware/validate";
import { addToCartValidation, updateCartItemValidation } from "../validators/cartValidator";

const router = Router();

router.get("/", authMiddleware, getCart);

router.get("/all", authMiddleware, adminMiddleware, getAllCarts);

router.get("/:id", authMiddleware, adminMiddleware, getCartById);

router.post("/", authMiddleware, validate(addToCartValidation), addToCart);

router.put("/:productId", authMiddleware, validate(updateCartItemValidation), updateCartItem);

router.delete("/:productId", authMiddleware, removeFromCart);

router.delete("/", authMiddleware, clearCart);

export default router;
