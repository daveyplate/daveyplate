const { i18n } = require('./i18n.config')

/** @type {import('next').NextConfig} */
module.exports = {
  i18n,
  reactStrictMode: true,
  outputFileTracingIncludes: {
    '**': ['*.json']
  },
  experimental: {
    scrollRestoration: true
  }
}
