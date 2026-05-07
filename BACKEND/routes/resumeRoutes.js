import express from "express";
import {
  uploadResume,
  getUserResumes,
  getResumeById,
} from "../controllers/resumeController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { upload } from "../config/multer.js";

const router = express.Router();

// Upload resume
router.post("/upload", authMiddleware, upload.single("resume"), uploadResume);

// Get all resumes of logged-in user
router.get("/", authMiddleware, getUserResumes);

// Get single resume by ID
router.get("/:id", authMiddleware, getResumeById);

export default router;