// The actual logic for signup/login/onboarding lives here.
// api/auth/auth.routes.ts just calls these functions — it has no logic of its own.
import { Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../config/db";
import { generateToken } from "./jwt";
import { AuthRequest } from "./auth.middleware";

// STEP 1: Signup — just email + password
export async function signup(req: AuthRequest, res: Response) {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    const token = generateToken(user.id);

    return res.status(201).json({
      message: "Account created",
      token,
      user: { id: user.id, email: user.email, isOnboarded: user.isOnboarded },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

// STEP 2: Onboarding — company name + country (runs AFTER signup, needs token)
export async function onboarding(req: AuthRequest, res: Response) {
  try {
    const { companyName, country } = req.body as { companyName?: string; country?: string };

    if (!companyName || !country) {
      return res.status(400).json({ message: "Company name and country are required" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.userId as string },
      data: { companyName, country, isOnboarded: true },
    });

    return res.status(200).json({
      message: "Onboarding complete",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        companyName: updatedUser.companyName,
        country: updatedUser.country,
        isOnboarded: updatedUser.isOnboarded,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

// LOGIN — for returning users
export async function login(req: AuthRequest, res: Response) {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user.id);

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        companyName: user.companyName,
        country: user.country,
        isOnboarded: user.isOnboarded,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

// GET CURRENT USER — "who's logged in right now"
export async function getMe(req: AuthRequest, res: Response) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId as string } });
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        companyName: user.companyName,
        country: user.country,
        isOnboarded: user.isOnboarded,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}