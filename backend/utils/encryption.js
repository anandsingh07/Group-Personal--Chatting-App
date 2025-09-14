const CryptoJS = require('crypto-js');

const DEFAULT_KEY = process.env.ENCRYPTION_KEY || 'secret@123';

// Encrypt with optional custom key (e.g., per room or per user)
exports.encrypt = (text, key = DEFAULT_KEY) => {
  return CryptoJS.AES.encrypt(text, key).toString();
};

// Decrypt with optional custom key
exports.decrypt = (cipher, key = DEFAULT_KEY) => {
  const bytes = CryptoJS.AES.decrypt(cipher, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};
