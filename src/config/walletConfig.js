// src/config/walletConfig.js
require('dotenv').config();

module.exports = {
  issuerId: process.env.ISSUER_ID,
  classSuffix: process.env.CLASS_SUFFIX,
  classId: `${process.env.ISSUER_ID}.${process.env.CLASS_SUFFIX}`,
  credentials: require('../../credentials/service-account.json'),
};