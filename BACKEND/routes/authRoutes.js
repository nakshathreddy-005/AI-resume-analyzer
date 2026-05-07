import express from "express";
import { registerUser, loginUser, getMe } from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Get current logged-in user (protected)
router.get("/me", authMiddleware, getMe);

export default router;