import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import { sendCandidatePasswordEmail } from "./email.service.js";

const generateTemporaryPassword = (length = 10) => {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$";
  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return password;
};

export const getAllCandidates = async () => {
  return await prisma.candidate.findMany({
   
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getCandidatesByInstructor = async (instructorId) => {
  return await prisma.candidate.findMany({
    where: {
      instructorId,
    },
   
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getCandidateById = async (id) => {
  return await prisma.candidate.findFirst({
    where: { id },
   
  });
};

export const createCandidate = async (data) => { 
    const existing = await prisma.candidate.findFirst({
    where: {
      OR: [
        { email: data.email },
        { phone: data.phone },
      ]
    }
  });

  if (existing) {
    throw new Error("CANDIDATE_ALREADY_EXISTS");
  }

  const plainPassword = generateTemporaryPassword(10);
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const candidate = await prisma.candidate.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      birthDate: new Date(data.birthDate),
      email: data.email || null,
      phone: data.phone || null,
      password: hashedPassword,
      licenseType: data.licenseType,
      address: data.address || null,
      bloodType: data.bloodType,
      registrationDate: data.registrationDate
        ? new Date(data.registrationDate)
        : null,
      totalPrice: data.totalPrice ? Number(data.totalPrice) : null,
      instructorId: Number(data.instructorId),
      drivingSchoolId: Number(data.drivingSchoolId),
    },
    include: {
      instructor: true,
      drivingSchool: true,
    },
  });

  if (candidate.email) {
    await sendCandidatePasswordEmail(
      candidate.email,
      `${candidate.firstName} ${candidate.lastName}`,
      plainPassword
    );
  }

  return candidate;
};

export const updateCandidate = async (id, data) => {
  return await prisma.candidate.update({
    where: { id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      email: data.email,
      phone: data.phone,
      licenseType: data.licenseType,
      address: data.address,
      bloodType: data.bloodType,
      registrationDate: data.registrationDate
        ? new Date(data.registrationDate)
        : undefined,
      totalPrice:
        data.totalPrice !== undefined ? Number(data.totalPrice) : undefined,
      instructorId:
        data.instructorId !== undefined
          ? Number(data.instructorId)
          : undefined,
      drivingSchoolId:
        data.drivingSchoolId !== undefined
          ? Number(data.drivingSchoolId)
          : undefined,
    },
    include: {
      instructor: true,
      drivingSchool: true,
    },
  });
};

export const deleteCandidate = async (id) => {
  return await prisma.candidate.delete({
    where: { id },
  });
};