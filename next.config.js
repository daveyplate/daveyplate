const withTM = require('next-transpile-modules')(['@stampmyvisa/react-flagpack']);
const { i18n } = require('./next-i18next.config')

/** @type {import('next').NextConfig} */
module.exports = withTM({
  i18n,
  reactStrictMode: true,
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
