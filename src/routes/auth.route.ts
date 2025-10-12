import { Router } from "express";
import {
  registerRequestOtp,
  registerVerifyOtp,
  loginRequestOtp,
  loginVerifyOtp,
  session,
  me,
  logout
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

// register
router.post("/register/request-otp", registerRequestOtp);
router.post("/register/verify-otp", registerVerifyOtp);

// login
router.post("/login/request-otp", loginRequestOtp);
router.post("/login/verify-otp", loginVerifyOtp);

// session
router.get("/session", session);           // tolerant check: { authenticated: boolean, user? }
router.get("/me", authMiddleware, me);     // strict: 401 if not logged in
router.post("/logout", logout);

export default router;
