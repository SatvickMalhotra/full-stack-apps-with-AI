// Test script to check Exotel API directly
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.REACT_APP_API_KEY;
const API_TOKEN = process.env.REACT_APP_API_TOKEN;
const ACCOUNT_SID = process.env.REACT_APP_ACCOUNT_SID;

console.log('Testing Exotel API...');
console.log('Account SID:', ACCOUNT_SID);
console.log('API Key:', API_KEY?.substring(0, 10) + '...');

// Test different endpoint formats
const endpoints = [
  `https://api.exotel.com/v1/Accounts/${ACCOUNT_SID}/IncomingPhoneNumbers`,
  `https://api.exotel.com/v1/Accounts/${ACCOUNT_SID}/IncomingPhoneNumbers.json`,
  `https://${ACCOUNT_SID}.exotel.com/v1/IncomingPhoneNumbers`,
  `https://${ACCOUNT_SID}.exotel.com/v1/IncomingPhoneNumbers.json`,
  `https://api.exotel.in/v1/Accounts/${ACCOUNT_SID}/IncomingPhoneNumbers`,
];

async function testEndpoint(url) {
  try {
    console.log(`\n🔍 Testing: ${url}`);
    const response = await axios.get(url, {
      auth: {
        username: API_KEY,
        password: API_TOKEN,
      },
    });
    console.log('✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2).substring(0, 500));
    return true;
  } catch (error) {
    console.log('❌ FAILED');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
    return false;
  }
}

async function runTests() {
  for (const endpoint of endpoints) {
    const success = await testEndpoint(endpoint);
    if (success) {
      console.log('\n🎉 FOUND WORKING ENDPOINT!');
      console.log('Use this URL format in your app:', endpoint);
      break;
    }
  }
}

runTests();
