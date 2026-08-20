// ONLY route definitions (URL -> function). Logic lives in modules/auth/auth.service.ts.
import { Router } from "express";
import { signup, onboarding, login, getMe } from "../../modules/auth/auth.service";
import { protect } from "../../modules/auth/auth.middleware";

const router = Router();

// Public — no token needed
router.post("/signup", signup);
router.post("/login", login);

// Protected — must send valid token in Authorization header
router.post("/onboarding", protect, onboarding);
router.get("/me", protect, getMe);

export default router;