import type { NextConfig } from "next"
import i18n from './i18n.config'
const isExport = process.env.NEXT_PUBLIC_IS_EXPORT === '1'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    '**': ['*.json']
  },
  experimental: {
    scrollRestoration: true
  },
  ...(isExport ? { output: 'export', images: { unoptimized: true } } : { i18n }),
}

export default nextConfig