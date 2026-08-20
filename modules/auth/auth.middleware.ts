// Checks if a request has a valid login token before letting it through.
// Auth-specific helper, lives inside modules/auth/.
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "./jwt";

// Extends Express's Request type so TypeScript knows about req.userId
export interface AuthRequest extends Request {
  userId?: string;
}

export function protect(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization; // expects: "Bearer <token>"

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}