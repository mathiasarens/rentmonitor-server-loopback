// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-webpack
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const path = require('path');
const webpack = require('webpack');
const slsw = require('serverless-webpack');
var nodeExternals = require('webpack-node-externals');

/**
 * Common configuration for both Node.js and Web
 */
const baseConfig = {
  mode: 'production',
  entry: slsw.lib.entries,
  // Uncomment the following line to enable source map
  // devtool: 'source-map',
  resolve: {
    extensions: ['.js'],
    alias: {
      cldr$: 'cldrjs',
      cldr: 'cldrjs/dist/cldr',
    },
  },
};

/**
 * Configuration for a Node.js compatible bundle
 */
const nodeConfig = {
  ...baseConfig,
  name: 'node',
  target: 'node', // For Node.js
  externals: [nodeExternals()],
  output: {
    filename: 'bundle-node.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd', // We can use `commonjs2` for Node.js
  },
};

// Expose two configurations for `webpack`. Use `--config-name <web|node>` to
// select a named entry.
module.exports = [nodeConfig];
