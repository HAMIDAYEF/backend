import { PaymentService } from '../services/payment.service.js';

function resolveStatus(error, fallback = 500) {
  return error.statusCode || fallback;
}

export const PaymentController = {
  // GET /records/payment
  async list(req, res) {
    try {
      const records = await PaymentService.getAll();
      return res.status(200).json({ records });
    } catch (error) {
      console.error('[PaymentController.list]', error);
      return res.status(resolveStatus(error)).json({
        message: error.message || 'Internal server error.',
      });
    }
  },

  // GET /records/payment/:id
  async getById(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid payment ID.' });
    }

    try {
      const record = await PaymentService.getOne(id);
      return res.status(200).json(record);
    } catch (error) {
      console.error('[PaymentController.getById]', error);
      return res.status(resolveStatus(error, 404)).json({
        message: error.message || 'Payment not found.',
      });
    }
  },

  // POST /records/payment
  async create(req, res) {
    try {
      const id = await PaymentService.create(req.body);
      return res.status(201).json({ id });
    } catch (error) {
      console.error('[PaymentController.create]', error);
      return res.status(resolveStatus(error, 400)).json({
        message: error.message || 'Failed to create payment.',
      });
    }
  },

  // PUT /records/payment/:id
  async update(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid payment ID.' });
    }

    try {
      const count = await PaymentService.update(id, req.body);
      return res.status(200).json({ updated: count });
    } catch (error) {
      console.error('[PaymentController.update]', error);
      return res.status(resolveStatus(error, 400)).json({
        message: error.message || 'Failed to update payment.',
      });
    }
  },

  // DELETE /records/payment/:id
  async remove(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid payment ID.' });
    }

    try {
      const count = await PaymentService.delete(id);
      return res.status(200).json({ deleted: count });
    } catch (error) {
      console.error('[PaymentController.remove]', error);
      return res.status(resolveStatus(error, 400)).json({
        message: error.message || 'Failed to delete payment.',
      });
    }
  },
};