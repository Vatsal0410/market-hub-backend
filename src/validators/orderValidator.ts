import { body } from "express-validator";

export const createOrderValidation = [
  body("shippingAddress")
    .notEmpty()
    .withMessage("Shipping address is required")
    .isObject()
    .withMessage("Shipping address must be an object"),
  body("shippingAddress.street")
    .notEmpty()
    .withMessage("Street is required")
    .trim()
    .isLength({ max: 200 })
    .withMessage("Street must be at most 200 characters"),
  body("shippingAddress.city")
    .notEmpty()
    .withMessage("City is required")
    .trim()
    .isLength({ max: 100 })
    .withMessage("City must be at most 100 characters"),
  body("shippingAddress.pincode")
    .notEmpty()
    .withMessage("Pincode is required")
    .trim()
    .isLength({ min: 4, max: 10 })
    .withMessage("Pincode must be 4-10 characters"),
  body("paymentMethod")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Payment method must be at most 50 characters"),
];

export const updateOrderStatusValidation = [
  body("orderStatus")
    .optional()
    .isIn(["processing", "shipped", "delivered", "cancelled"])
    .withMessage("Invalid order status"),
  body("paymentStatus")
    .optional()
    .isIn(["pending", "paid", "failed", "refunded"])
    .withMessage("Invalid payment status"),
];