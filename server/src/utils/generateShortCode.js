const crypto = require('crypto');

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Generate a random alphanumeric short code of specified length (default 6 chars)
 * @param {number} length 
 * @returns {string}
 */
const generateShortCode = (length = 6) => {
  let result = '';
  const charactersLength = CHARACTERS.length;
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    result += CHARACTERS.charAt(randomBytes[i] % charactersLength);
  }

  return result;
};

module.exports = generateShortCode;
