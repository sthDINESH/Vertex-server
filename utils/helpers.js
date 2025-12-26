const logger = require('../utils/logger')

/**
 * Retry logic with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries (default: 2)
 * @param {number} initialDelay - Initial delay in ms (default: 1000)
 * @returns {Promise}
 */
const retryWithBackoff = async (fn, maxRetries = 2, initialDelay = 1000) => {
  let lastError

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Only retry on timeout/network errors
      const isTimeoutError = error.code === 'ETIMEDOUT' ||
                             error.code === 'ECONNREFUSED' ||
                             error.message.includes('timeout')

      if (attempt < maxRetries && isTimeoutError) {
        const delay = initialDelay * Math.pow(2, attempt)
        logger.info(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      } else if (attempt === maxRetries) {
        logger.error(`All ${maxRetries + 1} attempts failed`)
        throw lastError
      } else {
        throw lastError
      }
    }
  }
}

module.exports = { retryWithBackoff }