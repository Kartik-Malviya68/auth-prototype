import bcrypt from "bcryptjs";

export function generateOtp(length = 6) {
    return Math.floor(Math.random() * 10 ** length)
        .toString()
        .padStart(length, "0");
}

export async function hashOtp(otp: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(otp, salt);
}

export async function verifyOtpHash(otp: string, hash: string) {
    return bcrypt.compare(otp, hash);
}

export function minutesFromNow(min: number) {
    const d = new Date();
    d.setMinutes(d.getMinutes() + min);
    return d;
}
