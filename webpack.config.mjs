import path from 'node:path';
import nodeExternals from 'webpack-node-externals';

export default {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  target: 'node',
  entry: './src/handler.ts',
  output: {
    path: path.resolve(process.cwd(), 'api'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
    clean: true,
  },
  resolve: { extensions: ['.ts', '.js'] },
  externalsPresets: { node: true },
  externals: [nodeExternals()],
  module: {
    rules: [{ test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ }],
  },
};
