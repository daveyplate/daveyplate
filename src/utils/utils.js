import { gzip, ungzip } from 'node-gzip'

export const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000'
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`
  return url
}

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
export function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
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
 * Generate a dynamic href based on the pathname and query object
 * Supports custom static export behavior for dynamic routing
 *
 * @param {Object} href - An object containing pathname and query.
 * @param {string} href.pathname - The path of the URL (can contain dynamic segments).
 * @param {Object} href.query - An object containing query parameters.
 * @returns {Object} The constructed href
 */
export const dynamicHref = ({ pathname, query }) => {
  if (!isExport()) return { pathname, query }

  return { pathname: pathname.replace("[", "").replace("]", ""), query }
}