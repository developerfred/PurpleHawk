const path = require('path');
const Dotenv = require('dotenv-webpack');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/content.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'content.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new Dotenv({
            systemvars: true,
        }),
        new CopyPlugin({
            patterns: [
                { from: 'src/manifest.json', to: 'manifest.json' },
                { from: 'src/styles.css', to: 'styles.css' },
            ],
        }),
    ],
};