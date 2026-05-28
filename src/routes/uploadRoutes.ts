import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { authMiddleware } from "../middleware/authMiddleware";
import { adminMiddleware } from "../middleware/adminMiddleware";
import { uploadMultiple } from "../middleware/uploadMiddleware";

interface MulterRequest extends Request {
  files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
}

const router = Router();

router.post("/images", authMiddleware, adminMiddleware, uploadMultiple, (req: MulterRequest, res: Response) => {
  if (!req.files) {
    return res.status(400).json({ success: false, message: "No files uploaded" });
  }

  const files = Array.isArray(req.files) ? req.files : req.files.images;
  if (!files || files.length === 0) {
    return res.status(400).json({ success: false, message: "No files uploaded" });
  }

  const images = files.map((file: Express.Multer.File) => ({
    filename: file.filename,
    originalName: file.originalname,
    path: `/uploads/${file.filename}`,
    mimetype: file.mimetype,
    size: file.size,
  }));

  res.status(201).json({ success: true, message: "Images uploaded successfully", data: images });
});

router.delete("/images/:filename", authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const filename = req.params.filename as string;
  const filePath = path.join(__dirname, "..", "..", "uploads", filename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ success: true, message: "Image deleted successfully" });
  } else {
    res.status(404).json({ success: false, message: "Image not found" });
  }
});

export default router;