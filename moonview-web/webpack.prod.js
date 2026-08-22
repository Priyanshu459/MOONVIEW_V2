const { merge } = require('webpack-merge');

const common = require('./webpack.common');

module.exports = merge(common, {
    mode: 'production',
    // Public production source maps: OFF 
    // Policy: Source maps expose application structure unnecessarily for a private deployment.
    devtool: false,
    entry: {
        ...common.entry,
        'serviceworker': './serviceworker.js'
    }
});
