"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = generateOtp;
exports.hashOtp = hashOtp;
exports.verifyOtpHash = verifyOtpHash;
exports.minutesFromNow = minutesFromNow;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
function generateOtp(length = 6) {
    return Math.floor(Math.random() * 10 ** length)
        .toString()
        .padStart(length, "0");
}
async function hashOtp(otp) {
    const salt = await bcryptjs_1.default.genSalt(10);
    return bcryptjs_1.default.hash(otp, salt);
}
async function verifyOtpHash(otp, hash) {
    return bcryptjs_1.default.compare(otp, hash);
}
function minutesFromNow(min) {
    const d = new Date();
    d.setMinutes(d.getMinutes() + min);
    return d;
}
