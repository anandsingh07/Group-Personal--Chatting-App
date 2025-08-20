const CryptoJS = require('crypto-js');

const SECRET_KEY = process.env.ENCRYPTION_KEY || 'secret@123'; 

exports.encrypt = (text) => CryptoJS.AES.encrypt(text, SECRET_KEY).toString();

exports.decrypt = (cipher) => {
  const bytes = CryptoJS.AES.decrypt(cipher, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
