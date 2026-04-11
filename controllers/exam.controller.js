import { ExamService } from '../services/exam.service.js';

function resolveStatus(error, fallback = 500) {
  return error.statusCode || fallback;
}

export const ExamController = {
  // GET /records/exam
  async list(req, res) {
    try {
      const records = await ExamService.getAll();
      return res.status(200).json({ records });
    } catch (error) {
      console.error('[ExamController.list]', error);
      return res.status(resolveStatus(error)).json({
        message: error.message || 'Internal server error.',
      });
    }
  },

  // GET /records/exam/:id
  async getById(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid exam ID.' });
    }

    try {
      const record = await ExamService.getOne(id);
      return res.status(200).json(record);
    } catch (error) {
      console.error('[ExamController.getById]', error);
      return res.status(resolveStatus(error, 404)).json({
        message: error.message || 'Exam not found.',
      });
    }
  },

  // POST /records/exam
  async create(req, res) {
    try {
      const id = await ExamService.create(req.body);
      return res.status(201).json({ id });
    } catch (error) {
      console.error('[ExamController.create]', error);
      return res.status(resolveStatus(error, 400)).json({
        message: error.message || 'Failed to create exam.',
      });
    }
  },

  // PUT /records/exam/:id
  async update(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid exam ID.' });
    }

    try {
      const count = await ExamService.update(id, req.body);
      return res.status(200).json({ updated: count });
    } catch (error) {
      console.error('[ExamController.update]', error);
      return res.status(resolveStatus(error, 400)).json({
        message: error.message || 'Failed to update exam.',
      });
    }
  },

  // DELETE /records/exam/:id
  async remove(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid exam ID.' });
    }

    try {
      const count = await ExamService.delete(id);
      return res.status(200).json({ deleted: count });
    } catch (error) {
      console.error('[ExamController.remove]', error);
      return res.status(resolveStatus(error, 400)).json({
        message: error.message || 'Failed to delete exam.',
      });
    }
  },
};