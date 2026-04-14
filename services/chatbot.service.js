
import { ExamService } from './exam.service.js';
import { PaymentService } from './payment.service.js';
import Groq from "groq-sdk";

// Initialize Groq with your API Key
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const ChatbotService = {
  async processMessage(userId, message) {
    const msg = message.toLowerCase();

    // --- 1. RULE-BASED MODE (MySQL Data) ---
    
    // Check for Exam keywords
    if (msg.includes('exam') || msg.includes('test') || msg.includes('date')) {
      const exams = await ExamService.getAll();
      const myExam = exams.find(e => e.candidateId === userId);
      return myExam 
        ? `Your exam is scheduled for ${new Date(myExam.examDate).toLocaleDateString()}. Status: ${myExam.status}.`
        : "You don't have any exams scheduled yet.";
    }

    // Check for Payment keywords
    if (msg.includes('payment') || msg.includes('pay') || msg.includes('money')) {
      const payments = await PaymentService.getAll();
      const myTotal = payments
        .filter(p => p.candidateId === userId)
        .reduce((sum, p) => sum + Number(p.amount), 0);
      return `Your total paid amount is ${myTotal} DT.`;
    }

    // --- 2. AI MODE (Groq Fallback) ---
    return await this.getGroqResponse(message);
  },

  async getGroqResponse(userPrompt) {
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a professional driving instructor in Algeia. Give short, helpful advice about traffic rules, driving tips, and exam preparation. Speak in a friendly way."
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        model: "llama-3.1-8b-instant", // Use Llama 3!
      });

      return chatCompletion.choices[0]?.message?.content || "I'm listening, tell me more!";
    } catch (error) {
      console.error("Groq API Error:", error);
      return "I'm having a small technical issue. Ask me about your exams instead!";
    }
  }
};
