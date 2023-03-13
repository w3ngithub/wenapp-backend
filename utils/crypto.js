const CryptoJS = require('crypto-js');

function encrypt(data, key) {
  // Encrypt
  const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();

  return ciphertext;
}

const LATE_ARRIVAL_KEY = 'latearrivalkey123456789';
const USERS_KEY = 'userkey123456789';
const CONFIGURATION_KEY = 'configurationkey123456789';
const SALARY_REVIEW_KEY = 'salaryreviewkey123456789';
const ACTIVITY_LOGS_KEY = 'activitylogskey123456789';

module.exports = {
  encrypt,
  LATE_ARRIVAL_KEY,
  USERS_KEY,
  CONFIGURATION_KEY,
  SALARY_REVIEW_KEY,
  ACTIVITY_LOGS_KEY
};
