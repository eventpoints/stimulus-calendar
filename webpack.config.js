const path = require('path');

module.exports = {
    entry: './src/stimulus-calendar.js',  // Entry point for your controller
    output: {
        filename: 'stimulus-calendar.mjs', // Name of the bundled ES module file
        path: path.resolve(__dirname, 'dist'), // Output directory
        library: {
            type: 'module',
        },
    },
    experiments: {
        outputModule: true,
    },
};