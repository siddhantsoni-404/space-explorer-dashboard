const axios = require('axios');

const nasaApi = axios.create({
  baseURL: 'https://api.nasa.gov',
  params: {
    api_key: process.env.NASA_API_KEY || 'DEMO_KEY'
  }
});

module.exports = nasaApi;
