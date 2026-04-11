import { InstructorService } from '../services/instructor.service.js';

export const InstructorController = {
  async list(req, res) {
    try {
      const records = await InstructorService.getAll();
      res.json({ records });
    } catch (error) {
      res.status(500).json({
        message: error.message || 'Internal server error',
      });
    }
  },

  async getById(req, res) {
    try {
      const id = Number(req.params.id);
      const record = await InstructorService.getOne(id);
      res.json(record);
    } catch (error) {
      res.status(404).json({
        message: error.message || 'Instructor not found',
      });
    }
  },

  async create(req, res) {
    try {
      const id = await InstructorService.create(req.body);
      res.status(201).json({ id });
    } catch (error) {
      res.status(400).json({
        message: error.message || 'Creation failed',
      });
    }
  },

  async update(req, res) {
    try {
      const id = Number(req.params.id);
      const count = await InstructorService.update(id, req.body);
      res.json({ updated: count });
    } catch (error) {
      res.status(400).json({
        message: error.message || 'Update failed',
      });
    }
  },

  async remove(req, res) {
    try {
      const id = Number(req.params.id);
      const count = await InstructorService.delete(id);
      res.json({ deleted: count });
    } catch (error) {
      res.status(400).json({
        message: error.message || 'Delete failed',
      });
    }
  },
};