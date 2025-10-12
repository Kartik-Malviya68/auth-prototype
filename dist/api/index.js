"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const serverless_http_1 = __importDefault(require("serverless-http"));
const app_1 = __importDefault(require("../src/app"));
const mongo_1 = require("../src/config/mongo");
let handler;
async function default_1(req, res) {
    await (0, mongo_1.connectMongoCached)(); // reuse Mongo connection across invocations
    handler = handler || (0, serverless_http_1.default)(app_1.default); // lazily create serverless handler
    return handler(req, res);
}
