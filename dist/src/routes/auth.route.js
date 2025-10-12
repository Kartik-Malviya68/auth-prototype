"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// register
router.post("/register/request-otp", auth_controller_1.registerRequestOtp);
router.post("/register/verify-otp", auth_controller_1.registerVerifyOtp);
// login
router.post("/login/request-otp", auth_controller_1.loginRequestOtp);
router.post("/login/verify-otp", auth_controller_1.loginVerifyOtp);
// session
router.get("/session", auth_controller_1.session); // tolerant check: { authenticated: boolean, user? }
router.get("/me", auth_1.authMiddleware, auth_controller_1.me); // strict: 401 if not logged in
router.post("/logout", auth_controller_1.logout);
exports.default = router;
