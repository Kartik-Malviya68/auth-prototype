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
    library: { type: "module" },
    module: true,
    clean: true,
  },
  experiments: { outputModule: true },

  // ⛔️ NO externals — bundle everything so PM2 never touches node_modules at runtime
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
  },
  ignoreWarnings: [
  /express[\\/]lib[\\/]view\.js.*Critical dependency/i,
],
  plugins: [
    // Silence optional Mongo deps that you don't use
    new webpack.IgnorePlugin({
      resourceRegExp:
        /^(gcp-metadata|snappy|socks|mongodb-client-encryption|kerberos|@mongodb-js\/zstd|@aws-sdk\/credential-providers)$/,
    }),
  ],

  ignoreWarnings: [
    /express[\\/]lib[\\/]view\.js.*Critical dependency/i,
  ],

  optimization: { minimize: false },
  stats: { errorDetails: true },
};
