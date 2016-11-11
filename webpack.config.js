var path = require("path");
var webpack = require("webpack");

module.exports = {
    devtool: "eval-source-map",
    entry: "./client/index.js",
    output: {
        filename: "./assets/bundle.js"
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ["es2015"],
                    cacheDirectory: true
                }
            },
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ]
};
