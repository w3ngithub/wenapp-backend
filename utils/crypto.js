const CryptoJS = require('crypto-js');

function encrypt(data, key) {
  // Encrypt
  const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();

  return ciphertext;
}

const LATE_ARRIVAL_KEY = 'latearrivalkey123456789';
const USERS_KEY = 'userkey123456789';

module.exports = { encrypt, LATE_ARRIVAL_KEY, USERS_KEY };
