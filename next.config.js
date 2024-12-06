const { i18n } = require('./i18n.config')
const isExport = process.env.NEXT_PUBLIC_IS_EXPORT === '1'

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    '**': ['*.json']
  },
  experimental: {
    scrollRestoration: true
  },
  ...(isExport ? { output: 'export', images: { unoptimized: true } } : { i18n }),
}
