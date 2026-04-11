import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const ALLOWED_STATUS = ['Scheduled', 'Passed', 'Failed', 'Cancelled', 'En attente'];

// Only expose what the frontend needs from the candidate
const CANDIDATE_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  phone: true,
};

function sanitizeUpdatePayload(data) {
  const forbidden = ['id', 'candidateId', 'createdAt'];
  const clean = { ...data };
  forbidden.forEach((key) => delete clean[key]);
  return clean;
}

export const ExamService = {
  // ── GET ALL ────────────────────────────────────────────────────────────────
  async getAll() {
    return prisma.exam.findMany({
      include: {
        candidate: { select: CANDIDATE_SELECT },
      },
      orderBy: { id: 'desc' },
    });
  },

  // ── GET ONE ────────────────────────────────────────────────────────────────
  async getOne(id) {
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        candidate: { select: CANDIDATE_SELECT },
      },
    });

    if (!exam) {
      const err = new Error('Exam not found.');
      err.statusCode = 404;
      throw err;
    }

    return exam;
  },

  // ── CREATE ─────────────────────────────────────────────────────────────────
  async create(data) {
    const { examDate, examType, candidateId, status } = data;

    // Validate required fields
    const missing = ['examDate', 'examType', 'candidateId'].filter(
      (f) => !data[f] || String(data[f]).trim() === ''
    );
    if (missing.length) {
      const err = new Error(`Missing required fields: ${missing.join(', ')}.`);
      err.statusCode = 400;
      throw err;
    }

    // Validate date
    const parsedDate = new Date(examDate);
    if (isNaN(parsedDate.getTime())) {
      const err = new Error('Invalid exam date.');
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

    // Validate status if provided
    const resolvedStatus = status || 'En attente';
    if (!ALLOWED_STATUS.includes(resolvedStatus)) {
      const err = new Error(`Invalid status. Allowed: ${ALLOWED_STATUS.join(', ')}.`);
      err.statusCode = 400;
      throw err;
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

    const exam = await prisma.exam.create({
      data: {
        examDate: parsedDate,
        examType: examType.trim(),
        status: resolvedStatus,
        candidateId: parsedCandidateId,
      },
    });

    return exam.id;
  },

  // ── UPDATE ─────────────────────────────────────────────────────────────────
  async update(id, rawData) {
    // Verify exists first → clean 404
    const existing = await prisma.exam.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      const err = new Error('Exam not found.');
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

    if (data.examDate !== undefined) {
      const parsed = new Date(data.examDate);
      if (isNaN(parsed.getTime())) {
        const err = new Error('Invalid exam date.');
        err.statusCode = 400;
        throw err;
      }
      safeData.examDate = parsed;
    }

    if (data.examType !== undefined) {
      if (!String(data.examType).trim()) {
        const err = new Error('examType cannot be empty.');
        err.statusCode = 400;
        throw err;
      }
      safeData.examType = data.examType.trim();
    }

    if (data.status !== undefined) {
      if (!ALLOWED_STATUS.includes(data.status)) {
        const err = new Error(`Invalid status. Allowed: ${ALLOWED_STATUS.join(', ')}.`);
        err.statusCode = 400;
        throw err;
      }
      safeData.status = data.status;
    }

    await prisma.exam.update({ where: { id }, data: safeData });
    return 1;
  },

  // ── DELETE ─────────────────────────────────────────────────────────────────
  async delete(id) {
    const existing = await prisma.exam.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      const err = new Error('Exam not found.');
      err.statusCode = 404;
      throw err;
    }

    await prisma.exam.delete({ where: { id } });
    return 1;
  },
};