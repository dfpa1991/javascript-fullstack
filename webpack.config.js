// Export an object
const path = require("path"); // Importing the path module
const HtmlWebpackPlugin = require("html-webpack-plugin"); // Importing the HtmlWebpackPlugin module
// Import mini css extract plugin
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const isDevelopment = process.env.NODE_ENV !== "production";

module.exports = {
    mode: "none", // Development mode
    entry: "./frontend/index.js",
    output: {
        path: path.join(__dirname, "backend/public"),
        filename: "js/index.js"
    },
    module: {
        rules: [
            { test: /\.s[ac]ss$/i,
               use: [isDevelopment ? "style-loader" : MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
            }
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./frontend/index.html",
            filename: "index.html",
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true
            }
        }),
        new MiniCssExtractPlugin({
            filename: "css/index.css",
        })
    ],
    devtool: 'source-map', // Source map for debugging
}