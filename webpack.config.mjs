// webpack.config.mjs
import path from "path";
import { fileURLToPath } from "url";
import nodeExternals from "webpack-node-externals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  target: "node",
  entry: path.resolve(__dirname, "src/index.ts"),
  output: {
    path: path.resolve(__dirname, "api"),
    filename: "index.js",
    library: { type: "module" },
    module: true,
    clean: true,
  },
  experiments: { outputModule: true },
  externalsPresets: { node: true },
  externalsType: "module",
  externals: [
    nodeExternals({
      importType: "module",
      allowlist: [/^bcryptjs$/],      // ✅ bundle bcryptjs to avoid PM2/CJS issues
    }),
  ],
  devtool: process.env.NODE_ENV === "production" ? false : "source-map",
  resolve: {
    // No extensionAlias! It was breaking node_modules resolution.
    extensions: [".ts", ".js", ".mjs", ".cjs"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [{ loader: "ts-loader", options: { transpileOnly: true } }],
        exclude: /node_modules/,
      },
    ],
  },
  optimization: { minimize: false },
  stats: { errorDetails: true },
};
