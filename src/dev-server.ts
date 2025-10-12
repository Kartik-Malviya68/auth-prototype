import app from "./app";
import { connectMongoCached } from "./config/mongo";

const port = Number(process.env.PORT || 4000);

async function main() {
  await connectMongoCached();
  app.listen(port, () => console.log(`🚀 auth server on :${port}`));
}
main().catch((e) => { console.error(e); process.exit(1); });
