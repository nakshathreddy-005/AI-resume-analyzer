import express from "express";
import { analyzeResume } from "../controllers/analysisController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Analyze resume by ID
router.post("/:resumeId", authMiddleware, analyzeResume);

export default router;