const CryptoJS = require('crypto-js');

function encrypt(data) {
  // Encrypt
  const ciphertext = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    'secret key 123'
  ).toString();

  return ciphertext;
}

module.exports = { encrypt };
