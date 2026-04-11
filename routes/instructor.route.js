import { Router } from 'express';
import { InstructorController } from '../controllers/instructor.controller.js';
// Assume these are imported from your middleware folder
import authMiddleware from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.js";

const router = Router();

// GET /records/instructor -> Read all instructors 
router.get(
  '/instructor', 
  authMiddleware, 
  authorize(['admin']), 
  InstructorController.list
);

// GET /records/instructor/:id -> Read a specific instructor by ID 
router.get(
  '/instructor/:id', 
  authMiddleware, 
  authorize(['admin', 'instructor']), 
  InstructorController.getById
);

// POST /records/instructor -> Add a new instructor 
router.post(
  '/instructor', 
  authMiddleware, 
  authorize(['admin']), 
  InstructorController.create
);

// PUT /records/instructor/:id -> Update an instructor 
router.put(
  '/instructor/:id', 
  authMiddleware, 
  authorize(['admin', 'instructor']), 
  InstructorController.update
);

// DELETE /records/instructor/:id -> Delete an instructor 
router.delete(
  '/instructor/:id', 
  authMiddleware, 
  authorize(['admin']), 
  InstructorController.remove
);

export default router;