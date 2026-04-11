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

export const AdminService = {
  async getAll() {
    return prisma.admin.findMany({
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
      throw new Error('Invalid admin ID');
    }

    const admin = await prisma.admin.findUnique({
      where: { id },
      include: {
        drivingSchool: true,
        payments: true,
      },
    });

    if (!admin) {
      throw new Error('Admin not found');
    }

    return admin;
  },

  async create(data) {
    // 🔒 validation
    if (
      !data.firstName ||
      !data.lastName ||
      !data.email ||
      !data.drivingSchoolId
    ) {
      throw new Error('Missing required fields');
    }

    // 🔒 strict email check
    const existing = await prisma.admin.findFirst({
      where: { email: data.email },
    });

    if (existing) {
      throw new Error('Email already exists');
    }

    // 🔐 password generation
    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const admin = await prisma.admin.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
        password: hashedPassword,
        drivingSchoolId: data.drivingSchoolId,
      },
    });

    // 📧 async email (non-blocking)
    this.sendWelcomeEmail(data.email, plainPassword).catch(console.error);

    return admin.id;
  },

  async update(id, data) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid admin ID');
    }

    const admin = await prisma.admin.findUnique({
      where: { id },
    });

    if (!admin) {
      throw new Error('Admin not found');
    }

    // 🔒 prevent sensitive updates
    const safeData = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      drivingSchoolId: data.drivingSchoolId,
    };

    Object.keys(safeData).forEach(
      (key) => safeData[key] === undefined && delete safeData[key]
    );

    await prisma.admin.update({
      where: { id },
      data: safeData,
    });

    return 1;
  },

  async delete(id) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid admin ID');
    }

    const admin = await prisma.admin.findUnique({
      where: { id },
    });

    if (!admin) {
      throw new Error('Admin not found');
    }

    await prisma.admin.delete({
      where: { id },
    });

    return 1;
  },

  async sendWelcomeEmail(email, password) {
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.warn('Email config missing');
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
      subject: 'Your Admin Account',
      text: `Hello,

Your admin account has been created.

Email: ${email}
Password: ${password}

Please login and change your password.`,
    });
  },
};