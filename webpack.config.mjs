// webpack.config.mjs
import path from "path";
import { fileURLToPath } from "url";
import webpack from "webpack";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  target: "node",
  entry: path.resolve(__dirname, "src/index.ts"),
  output: {
    path: path.resolve(__dirname, "api"),
    filename: "index.js",
    library: { type: "module" }, // ESM output
    module: true,
    clean: true,
  },
  experiments: { outputModule: true },

  // Bundle everything so PM2 never touches node_modules at runtime
  devtool: process.env.NODE_ENV === "production" ? false : "source-map",

  resolve: {
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

    // 👇 Extra safety: globally disable “expr context is critical” noise
    parser: {
      javascript: {
        exprContextCritical: false,
      },
    },
  },

  plugins: [
    // Silence optional MongoDB deps you don't use
    new webpack.IgnorePlugin({
      resourceRegExp:
        /^(gcp-metadata|snappy|socks|mongodb-client-encryption|kerberos|@mongodb-js\/zstd|@aws-sdk\/credential-providers)$/,
    }),
  ],

  // 👇 Robust filter: hide ONLY the Express view.js warning (works on Windows paths)
  ignoreWarnings: [
    (warning) => {
      const msg = String(warning.message || "");
      const res = String(warning.module?.resource || "");
      const isCritical = msg.includes("Critical dependency");
      const isExpressView =
        /express[\\/]+lib[\\/]+view\.js$/i.test(res) ||
        /node_modules[\\/]+express[\\/]+lib[\\/]+view\.js$/i.test(res);
      return isCritical && isExpressView;
    },
  ],

  optimization: { minimize: false },
  stats: { errorDetails: true },
};
