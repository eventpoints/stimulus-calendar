const path = require('path');

module.exports = {
    entry: './src/stimulus-calendar.js',
    output: {
        filename: 'stimulus-calendar.mjs',
        path: path.resolve(__dirname, 'dist'),
        library: {
            type: 'module',
        },
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
        ],
    },
    experiments: {
        outputModule: true,
    },
};