"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const mongo_1 = require("./config/mongo");
const env_1 = require("./config/env");
async function main() {
    await (0, mongo_1.connectMongoCached)();
    const port = Number(process.env.PORT || env_1.env.PORT || 4000);
    app_1.default.listen(port, () => console.log(`🚀 Bravo backend on http://localhost:${port}`));
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
