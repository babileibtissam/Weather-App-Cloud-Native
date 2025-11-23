import express from "express";
import { getWeather } from "../controllers/weatherController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getWeather);

export default router;