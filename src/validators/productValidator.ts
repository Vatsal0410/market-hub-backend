import { body } from "express-validator";

export const createProductValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ max: 200 })
    .withMessage("Product name must be at most 200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must be at most 1000 characters"),
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),
  body("unit")
    .trim()
    .notEmpty()
    .withMessage("Unit is required")
    .isLength({ max: 50 })
    .withMessage("Unit must be at most 50 characters"),
  body("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid category ID"),
  body("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array")
    .custom((arr) => {
      if (arr && !arr.every((url: string) => typeof url === "string")) {
        throw new Error("Images must be an array of URLs");
      }
      return true;
    }),
  body("isAvailable")
    .optional()
    .isBoolean()
    .withMessage("isAvailable must be a boolean"),
];

export const updateProductValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Product name must be at most 200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must be at most 1000 characters"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),
  body("unit")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Unit must be at most 50 characters"),
  body("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid category ID"),
  body("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array"),
  body("isAvailable")
    .optional()
    .isBoolean()
    .withMessage("isAvailable must be a boolean"),
];