// Creates and verifies login tokens. Auth-specific, lives inside modules/auth/.
import jwt from "jsonwebtoken";

export function generateToken(userId: string): string {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): { userId: string } {
  return jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
}