import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const ALLOWED_PAYMENT_METHODS = ['Cash', 'Card', 'Transfer', 'Cheque'];

const CANDIDATE_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  phone: true,
};

const ADMIN_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
};

function sanitizeUpdatePayload(data) {
  const forbidden = ['id', 'candidateId', 'createdBy', 'createdAt'];
  const clean = { ...data };
  forbidden.forEach((key) => delete clean[key]);
  return clean;
}

export const PaymentService = {
  // ── GET ALL ────────────────────────────────────────────────────────────────
  async getAll() {
    return prisma.payment.findMany({
      include: {
        candidate: { select: CANDIDATE_SELECT },
        admin:     { select: ADMIN_SELECT },
      },
      orderBy: { id: 'desc' },
    });
  },

  // ── GET ONE ────────────────────────────────────────────────────────────────
  async getOne(id) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        candidate: { select: CANDIDATE_SELECT },
        admin:     { select: ADMIN_SELECT },
      },
    });

    if (!payment) {
      const err = new Error('Payment not found.');
      err.statusCode = 404;
      throw err;
    }

    return payment;
  },

  // ── CREATE ─────────────────────────────────────────────────────────────────
  async create(data) {
    const { amount, candidateId, createdBy, paymentTime, paymentMethod } = data;

    // Validate required fields
    const missing = ['amount', 'candidateId', 'paymentMethod'].filter(
      (f) => data[f] === undefined || data[f] === null || String(data[f]).trim() === ''
    );
    if (missing.length) {
      const err = new Error(`Missing required fields: ${missing.join(', ')}.`);
      err.statusCode = 400;
      throw err;
    }

    // Validate amount
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      const err = new Error('Amount must be a positive number.');
      err.statusCode = 400;
      throw err;
    }

    // Validate paymentMethod
    if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
      const err = new Error(`Invalid payment method. Allowed: ${ALLOWED_PAYMENT_METHODS.join(', ')}.`);
      err.statusCode = 400;
      throw err;
    }

    // Validate candidateId
    const parsedCandidateId = Number(candidateId);
    if (!Number.isInteger(parsedCandidateId) || parsedCandidateId <= 0) {
      const err = new Error('Invalid candidateId.');
      err.statusCode = 400;
      throw err;
    }

    // Validate paymentTime if provided
    let parsedPaymentTime = new Date();
    if (paymentTime) {
      parsedPaymentTime = new Date(paymentTime);
      if (isNaN(parsedPaymentTime.getTime())) {
        const err = new Error('Invalid payment date.');
        err.statusCode = 400;
        throw err;
      }
    }

    // Check candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { id: parsedCandidateId },
      select: { id: true },
    });
    if (!candidate) {
      const err = new Error('Candidate not found.');
      err.statusCode = 404;
      throw err;
    }

    // Check admin exists if provided
    let parsedCreatedBy = null;
    if (createdBy) {
      parsedCreatedBy = Number(createdBy);
      if (!Number.isInteger(parsedCreatedBy) || parsedCreatedBy <= 0) {
        const err = new Error('Invalid createdBy (admin ID).');
        err.statusCode = 400;
        throw err;
      }
      const admin = await prisma.admin.findUnique({
        where: { id: parsedCreatedBy },
        select: { id: true },
      });
      if (!admin) {
        const err = new Error('Admin not found.');
        err.statusCode = 404;
        throw err;
      }
    }

    const payment = await prisma.payment.create({
      data: {
        amount:        parsedAmount,
        paymentMethod: paymentMethod.trim(),
        paymentTime:   parsedPaymentTime,
        candidateId:   parsedCandidateId,
        createdBy:     parsedCreatedBy,
      },
    });

    return payment.id;
  },

  // ── UPDATE ─────────────────────────────────────────────────────────────────
  async update(id, rawData) {
    const existing = await prisma.payment.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      const err = new Error('Payment not found.');
      err.statusCode = 404;
      throw err;
    }

    const data = sanitizeUpdatePayload(rawData);

    if (Object.keys(data).length === 0) {
      const err = new Error('No valid fields provided for update.');
      err.statusCode = 400;
      throw err;
    }

    const safeData = {};

    if (data.amount !== undefined) {
      const parsed = Number(data.amount);
      if (isNaN(parsed) || parsed <= 0) {
        const err = new Error('Amount must be a positive number.');
        err.statusCode = 400;
        throw err;
      }
      safeData.amount = parsed;
    }

    if (data.paymentMethod !== undefined) {
      if (!ALLOWED_PAYMENT_METHODS.includes(data.paymentMethod)) {
        const err = new Error(`Invalid payment method. Allowed: ${ALLOWED_PAYMENT_METHODS.join(', ')}.`);
        err.statusCode = 400;
        throw err;
      }
      safeData.paymentMethod = data.paymentMethod.trim();
    }

    if (data.paymentTime !== undefined) {
      const parsed = new Date(data.paymentTime);
      if (isNaN(parsed.getTime())) {
        const err = new Error('Invalid payment date.');
        err.statusCode = 400;
        throw err;
      }
      safeData.paymentTime = parsed;
    }

    await prisma.payment.update({ where: { id }, data: safeData });
    return 1;
  },

  // ── DELETE ─────────────────────────────────────────────────────────────────
  async delete(id) {
    const existing = await prisma.payment.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      const err = new Error('Payment not found.');
      err.statusCode = 404;
      throw err;
    }

    await prisma.payment.delete({ where: { id } });
    return 1;
  },
};