import { body } from "express-validator";

export const createCategoryValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ max: 100 })
    .withMessage("Category name must be at most 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must be at most 500 characters"),
  body("image")
    .optional()
    .trim()
    .isURL()
    .withMessage("Image must be a valid URL"),
  body("parentCategory")
    .optional()
    .isMongoId()
    .withMessage("Invalid parent category ID"),
];

export const updateCategoryValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Category name must be at most 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must be at most 500 characters"),
  body("image")
    .optional()
    .trim()
    .isURL()
    .withMessage("Image must be a valid URL"),
  body("parentCategory")
    .optional()
    .isMongoId()
    .withMessage("Invalid parent category ID"),
];