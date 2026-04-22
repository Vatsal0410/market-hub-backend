import { body } from "express-validator";

export const updateUserValidation = [
  body("fname")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("First name must be at most 50 characters"),
  body("lname")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Last name must be at most 50 characters"),
  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Role must be either user or admin"),
  body("isEmailVerified")
    .optional()
    .isBoolean()
    .withMessage("isEmailVerified must be a boolean"),
];