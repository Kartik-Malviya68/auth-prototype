"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongoCached = connectMongoCached;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
let cached = global._mongooseCached;
if (!cached) {
    cached = global._mongooseCached = { conn: null, promise: null };
}
async function connectMongoCached() {
    if (cached.conn)
        return cached.conn;
    if (!cached.promise) {
        if (!env_1.env.MONGO_URI)
            throw new Error("MONGO_URI missing");
        cached.promise = mongoose_1.default.connect(env_1.env.MONGO_URI).then((m) => m);
    }
    cached.conn = await cached.promise;
    return cached.conn;
}
