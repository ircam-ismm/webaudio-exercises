const path = require('path');

module.exports = {
  entry: {
    'index': './src/index.js',
  },
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'public', 'build'),
  },
  module: {
    rules: [
      {
        test: /\.(js|mjs)$/,
        // 'exclude': /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env',
                {
                  targets: 'ios >= 9, not ie 11, not op_mini all',
                }
              ]
            ],
            plugins: [
              ['@babel/plugin-transform-arrow-functions'], // for iOS 9 : https://caniuse.com/arrow-functions
              ['@babel/plugin-proposal-class-properties']
            ],
          },
        },
      },
    ],
  },
};


