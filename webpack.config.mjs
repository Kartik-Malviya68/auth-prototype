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

  // ⬇️ Bundle bcryptjs; leave the rest external as ESM imports
  externalsType: "module",
  externals: [
    nodeExternals({
      importType: "module",
      allowlist: [/^bcryptjs$/], // <— IMPORTANT
    }),
  ],

  devtool: process.env.NODE_ENV === "production" ? false : "source-map",
  resolve: {
    extensions: [".ts", ".js", ".mjs", ".cjs"],
    extensionAlias: {
      ".js": [".ts", ".js"],
      ".mjs": [".mts", ".mjs"],
      ".cjs": [".cts", ".cjs"],
    },
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
