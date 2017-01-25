const ExtractTextPlugin = require('extract-text-webpack-plugin');
var webpack = require('webpack');
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
    entry: "./demo/scripts/index.ts",
    output: {
        filename: "bundle.js",
        path: __dirname + "/dist"
    },
    // Enable sourcemaps for debugging webpack's output.
    // devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            {
                test: /\.tsx?$/,
                use: ["awesome-typescript-loader"]
            },
            {
                test: /\.(css|less)$/,
                loader: ExtractTextPlugin.extract({
                    fallbackLoader: 'style-loader',
                    loader: 'css-loader!less-loader'
                })
            },
            {
                test: /\.(jpg|png|woff|woff2|eot|ttf|svg)$/,
                use: ['url-loader?limit=100000']
            }
        ]
    },

    plugins: [
        new ExtractTextPlugin({
            filename: "styles.css",
            allChunks: true
        }),
        new OptimizeCssAssetsPlugin({
            cssProcessorOptions: {
                discardComments: {
                    removeAll: true
                }
            },
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            output: {
                comments: false
            }
        })
    ]
};
