import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller.js';
import authMiddleware from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.js";

const router = Router();

// GET /records/payment
router.get('/payment', authMiddleware, authorize(['admin']), PaymentController.list);

// GET /records/payment/:id
router.get('/payment/:id', authMiddleware, authorize(['admin']), PaymentController.getById);

// POST /records/payment
router.post('/payment', authMiddleware, authorize(['admin']), PaymentController.create);

// PUT /records/payment/:id
router.put('/payment/:id', authMiddleware, authorize(['admin']), PaymentController.update);

// DELETE /records/payment/:id
router.delete('/payment/:id', authMiddleware, authorize(['admin']), PaymentController.remove);

export default router;