import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

function generatePassword(length = 10) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export const InstructorService = {
  async getAll() {
    return prisma.instructor.findMany({
      include: {
        drivingSchool: true,
      },
      orderBy: {
        id: 'desc',
      },
    });
  },

  async getOne(id) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid instructor ID');
    }

    const instructor = await prisma.instructor.findUnique({
      where: { id },
      include: {
        schedules: true,
        candidates: true,
        drivingSchool: true,
      },
    });

    if (!instructor) {
      throw new Error('Instructor not found');
    }

    return instructor;
  },

  async create(data) {
    // 🔒 Validation
    if (
      !data.firstName ||
      !data.lastName ||
      !data.email ||
      !data.drivingSchoolId
    ) {
      throw new Error('Missing required fields');
    }

    // h Check email first
    const existing = await prisma.instructor.findFirst({
  where: { email: data.email },
});

    if (existing) {
      throw new Error('Email already exists');
    }

    // 🔐 Generate + hash password
    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const instructor = await prisma.instructor.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
        phone: data.phone || null,
        specialty: data.specialty || null,
        drivingSchoolId: data.drivingSchoolId,
      },
    });

    // 📧 Send email (non-blocking)
    this.sendWelcomeEmail(data.email, plainPassword).catch(console.error);

    return instructor.id;
  },

  async update(id, data) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid instructor ID');
    }

    // Prevent updating sensitive fields directly
    delete data.password;
    delete data.email; // optional: remove if you want email editable

    await prisma.instructor.update({
      where: { id },
      data,
    });

    return 1;
  },

  async delete(id) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid instructor ID');
    }

    await prisma.instructor.delete({
      where: { id },
    });

    return 1;
  },

  async sendWelcomeEmail(email, password) {
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.warn('Mail config missing. Skipping email.');
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Driving School" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Your Instructor Account',
      text: `Hello,

Your instructor account has been created.

Email: ${email}
Password: ${password}

Please login and change your password.

Regards.`,
    });
  },
};