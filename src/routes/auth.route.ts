import { Router } from "express";
import {
  registerRequestOtp,
  registerVerifyOtp,
  loginRequestOtp,
  loginVerifyOtp,
  session,
  me,
  logout,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.post("/register/request-otp", registerRequestOtp);
router.post("/register/verify-otp", registerVerifyOtp);
router.post("/login/request-otp", loginRequestOtp);
router.post("/login/verify-otp", loginVerifyOtp);
router.get("/session", session);
router.get("/me", authMiddleware, me);
router.post("/logout", logout);

export default router; // ✅
