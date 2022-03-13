const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: './public/js/index.js',
    output: {
        filename: '[name].bundle.js',
        path: `${__dirname}/dist`
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
        }),
    ],
    mode: 'development',
};

