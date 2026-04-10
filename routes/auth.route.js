import express from "express";
import { login, me } from "../controllers/auth.controller.js"; // Note le .js
import authMiddleware from "../middlewares/auth.middleware.js"; // Note le .js

const router = express.Router();

router.post("/login", login);
router.get("/me", authMiddleware, me);

export default router;