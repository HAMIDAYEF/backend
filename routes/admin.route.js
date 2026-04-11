import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import authMiddleware from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.js";

const router = Router();

// Maintaining /records/admin route structure for Angular 
router.get('/admin', authMiddleware, authorize(['admin']), AdminController.list);
router.get('/admin/:id', authMiddleware, authorize(['admin']), AdminController.getById);
router.post('/admin', authMiddleware, authorize(['admin']), AdminController.create);
router.put('/admin/:id', authMiddleware, authorize(['admin']), AdminController.update);
router.delete('/admin/:id', authMiddleware, authorize(['admin']), AdminController.remove);

export default router;