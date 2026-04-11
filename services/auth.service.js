import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js"; // Vérifie que ce fichier existe avec .js

// Fonction interne pour générer le token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Fonction interne pour chercher l'utilisateur dans les 3 tables
const findUserByEmail = async (email) => {
  // 1. Chercher dans Admin
  const admin = await prisma.admin.findFirst({ where: { email } });
  if (admin) {
    return { ...admin, role: "admin" };
  }

  // 2. Chercher dans Instructor
  const instructor = await prisma.instructor.findFirst({ where: { email } });
  if (instructor) {
    return { ...instructor, role: "instructor" };
  }

  // 3. Chercher dans Candidate
  const candidate = await prisma.candidate.findFirst({ where: { email } });
  if (candidate) {
    return { ...candidate, role: "candidate" };
  }

  return null;
};

// --- EXPORTS POUR LE CONTROLLER ---

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error("INVALID_email");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("mafihach");
  }

  const token = generateToken({
    id: user.id,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  };
};

export const getConnectedUserProfile = async (userId, role) => {
  const table = prisma[role]; // Utilise dynamiquement la bonne table (admin, instructor, candidate)
  
  if (!table) return null;

  return await table.findFirst({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  });
};

const hash = await bcrypt.hash("password123", 10);
console.log(hash);