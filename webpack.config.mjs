// webpack.config.mjs
import path from "path";
import { fileURLToPath } from "url";
import nodeExternals from "webpack-node-externals";
import webpack from "webpack";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Build a base externals handler
const baseExternals = nodeExternals({
  importType: "module", // keep ESM externals for the rest
});

// Wrap it to ALWAYS bundle bcryptjs
function externalsExceptBcryptjs(context, request, callback) {
  // If the request is bcryptjs or any subpath, DO NOT externalize
  if (/^bcryptjs(\/.*)?$/.test(request)) return callback(); // bundled

  // Otherwise, delegate to nodeExternals (externalize)
  return baseExternals(context, request, callback);
}

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
  externals: [externalsExceptBcryptjs], // 👈 use our wrapper

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
    parser: { javascript: { exprContextCritical: false } },
  },

  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp:
        /^(gcp-metadata|snappy|socks|mongodb-client-encryption|kerberos|@mongodb-js\/zstd|@aws-sdk\/credential-providers)$/,
    }),
  ],

  ignoreWarnings: [/express[\\/]lib[\\/]view\.js.*Critical dependency/i],

  optimization: { minimize: false },
  stats: { errorDetails: true },
};
