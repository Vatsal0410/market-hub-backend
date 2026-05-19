import { Router } from "express";
import { createOrder, getUserOrders, getOrderById, getAllOrders, updateOrderStatus, cancelOrder, deleteOrder, restoreOrder, updatePaymentStatus, getOrderStats } from "../controllers/orderController";
import { authMiddleware } from "../middleware/authMiddleware";
import { adminMiddleware } from "../middleware/adminMiddleware";
import { validate } from "../middleware/validate";
import { createOrderValidation, updateOrderStatusValidation } from "../validators/orderValidator";

const router = Router();

router.post("/", authMiddleware, validate(createOrderValidation), createOrder);

router.get("/", authMiddleware, getUserOrders);

router.get("/all", authMiddleware, adminMiddleware, getAllOrders);

router.get("/stats", authMiddleware, getOrderStats);

router.get("/:id", authMiddleware, getOrderById);

router.put("/:id/status", authMiddleware, adminMiddleware, validate(updateOrderStatusValidation), updateOrderStatus);

router.put("/:id/payment-status", authMiddleware, adminMiddleware, updatePaymentStatus);

router.put("/:id/cancel", authMiddleware, cancelOrder);

router.delete("/:id", authMiddleware, adminMiddleware, deleteOrder);

router.put("/:id/restore", authMiddleware, adminMiddleware, restoreOrder);

export default router;
