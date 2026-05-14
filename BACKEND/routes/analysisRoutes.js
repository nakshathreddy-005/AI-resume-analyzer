import express from "express";
import { analyzeResume, rewriteResume } from "../controllers/analysisController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Generate improved downloadable resume by ID
router.post("/:resumeId/rewrite", authMiddleware, rewriteResume);

// Analyze resume by ID
router.post("/:resumeId", authMiddleware, analyzeResume);

export default router;
