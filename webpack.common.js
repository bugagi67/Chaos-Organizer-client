const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
// const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  output: {
    path: path.resolve(__dirname, "dist"),
    // publicPath: "./",
  },
  devServer: {
    port: 8080,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
          },
        ],
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
    ],
  },
  optimization: {
    minimize: true,
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      filename: "index.html",
      inject: "body",
    }),
    // new CopyWebpackPlugin({
    //   patterns: [
    //     { from: "src/images", to: "images" }, // Копируем папку с картинками
    //   ],
    // }),
  ],
};
