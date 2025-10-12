import app from "./app";
import { connectMongoCached } from "./config/mongo";
import { env } from "./config/env";

async function main() {
  await connectMongoCached();
  const port = Number(process.env.PORT || env.PORT || 4000);
  app.listen(port, () => console.log(`🚀 Bravo backend on http://localhost:${port}`));
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
