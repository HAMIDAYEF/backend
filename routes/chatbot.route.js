import { Router } from 'express';
import { ChatbotController } from '../controllers/chatbot.controller.js';
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

// POST /records/chatbot
router.post('/chatbot', authMiddleware, ChatbotController.chat);

export default router;