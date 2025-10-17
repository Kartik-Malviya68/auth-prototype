import path from "path";
import { fileURLToPath } from "url";
import nodeExternals from "webpack-node-externals";
import webpack from "webpack";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  target: "node", // Important for backend builds
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
  externals: [nodeExternals({ importType: "module" })],

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

  // 👇 Silence all the noisy MongoDB optional deps & Express warnings
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^(gcp-metadata|snappy|socks|mongodb-client-encryption|kerberos|@mongodb-js\/zstd|@aws-sdk\/credential-providers)$/,
    }),
  ],

  // 👇 Replace deprecated stats.warningsFilter
  ignoreWarnings: [
    // Express' dynamic require warning in view.js
    /express[\\/]lib[\\/]view\.js.*Critical dependency/i,
  ],

  optimization: { minimize: false },
  stats: { errorDetails: true },
};
