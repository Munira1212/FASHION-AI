const webpack = require('webpack');
module.exports = {
  resolve: {
    extensions: ['.web.js', '.js', '.json', '.jsx'],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    }),
  ],
};
