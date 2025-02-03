const { HotModuleReplacementPlugin } = require("webpack");
const { merge } = require("webpack-merge");
const path = require("path");
const common = require("./webpack.common");

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    client: {
      overlay: false,
    },
    historyApiFallback: true,
    open: true,
    compress: true,
    static: {
      directory: path.join(__dirname, "src"),
    },
    hot: true,
  },
  plugins: [new HotModuleReplacementPlugin()],
});
