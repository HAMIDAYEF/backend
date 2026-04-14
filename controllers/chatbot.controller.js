import { ChatbotService } from '../services/chatbot.service.js';

export const ChatbotController = {
  async chat(req, res) {
    try {
      const { message } = req.body;
      const userId = req.user.id; // From your authMiddleware

      if (!message) return res.status(400).json({ message: "Message is required" });

      const reply = await ChatbotService.processMessage(userId, message);
      res.json({ reply });
    } catch (error) {
      res.status(500).json({ message: "Error in chatbot controller" });
    }
  }
};