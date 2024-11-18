import { gzip, ungzip } from 'node-gzip'

/**
 * Get the full URL of the site.
 * @returns {string} The full URL of the site.
 */
export const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000'
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`
  return url
}

/**
 * Compress and base64 encode a string
 * @param {string} string The string to compress
 * @returns {Promise<string>} The compressed base64 string
 */
export const compress = async (string) => {
  const compressed = await gzip(string)
  return Buffer.from(compressed).toString('base64')
}

/**
 * Decompress a base64 encoded string
 * @param {string} base64String The base64 encoded string to decompress
 * @returns {Promise<string>} The decompressed string
 */
export const decompress = async (base64String) => {
  const compressedBuffer = Buffer.from(base64String, 'base64')
  const uncompressed = await ungzip(compressedBuffer)
  return uncompressed.toString()
}

/**
 * Check if the app is being exported
 * @returns {bool} NEXT_PUBLIC_IS_EXPORT == "1"
 */
export const isExport = () => {
  return process.env.NEXT_PUBLIC_IS_EXPORT == "1"
}

/**
 * Check if the current device is running iOS.
 * @returns {boolean} True if the device is running iOS, false otherwise.
 */
export const iOS = () => {
  return navigator.userAgent.match(/(iPad|iPhone|iPod)/g)
    // iPad on iOS 13 detection
    || (navigator.userAgent.includes("Mac") && navigator.maxTouchPoints > 1)
}