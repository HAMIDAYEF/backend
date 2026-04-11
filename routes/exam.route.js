import { Router } from 'express';
import { ExamController } from '../controllers/exam.controller.js';
import authMiddleware from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.js";

const router = Router();

// GET /records/exam
router.get('/exam', authMiddleware, authorize(['admin', 'instructor']), ExamController.list);

// GET /records/exam/:id
router.get('/exam/:id', authMiddleware, authorize(['admin', 'instructor']), ExamController.getById);

// POST /records/exam
router.post('/exam', authMiddleware, authorize(['admin']), ExamController.create);

// PUT /records/exam/:id
router.put('/exam/:id', authMiddleware, authorize(['admin']), ExamController.update);

// DELETE /records/exam/:id
router.delete('/exam/:id', authMiddleware, authorize(['admin']), ExamController.remove);

export default router;