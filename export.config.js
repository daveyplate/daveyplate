const withTM = require('next-transpile-modules')(['@stampmyvisa/react-flagpack']);

/** @type {import('next').NextConfig} */
module.exports = withTM({
    output: "export",
    images: { unoptimized: true },
    webpack: (config, { isServer }) => {
        config.module.rules.push({
            test: /\.svg$/,
            include: /node_modules\/@stampmyvisa\/react-flagpack\/dist\/flags/,
            use: [
                {
                    loader: 'file-loader',
                    options: {
                        name: '[path][name].[hash].[ext]', // Update this line
                        outputPath: 'static/flags/',
                        publicPath: '/_next/static/flags/',
                        emitFile: !isServer,
                    },
                },
            ],
        });

        return config;
    },
})
