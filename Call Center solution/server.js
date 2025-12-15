const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const API_KEY = process.env.REACT_APP_API_KEY;
const API_TOKEN = process.env.REACT_APP_API_TOKEN;
const ACCOUNT_SID = process.env.REACT_APP_ACCOUNT_SID;

// Proxy endpoint for Exotel API
app.use('/api/exotel', async (req, res) => {
  try {
    // Extract the path after /api/exotel/
    const exotelPath = req.path.substring(1); // Remove leading slash
    const url = `https://api.exotel.com/${exotelPath}`;

    console.log('=== Exotel API Request ===');
    console.log('URL:', url);
    console.log('Method:', req.method);
    console.log('Body:', req.body);

    // Prepare request config
    const config = {
      method: req.method,
      url: url,
      auth: {
        username: API_KEY,
        password: API_TOKEN,
      },
      headers: {
        'Accept': 'application/xml, application/json, */*',
      },
    };

    // For POST requests, send as form-urlencoded
    if (req.method === 'POST' && req.body) {
      const params = new URLSearchParams();
      Object.keys(req.body).forEach(key => {
        params.append(key, req.body[key]);
      });
      config.data = params.toString();
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      console.log('Form data:', params.toString());
    }

    const response = await axios(config);

    console.log('=== Exotel API Response ===');
    console.log('Status:', response.status);

    res.status(response.status).send(response.data);
  } catch (error) {
    console.error('=== Exotel API Error ===');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      res.status(error.response.status).send(error.response.data);
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`Exotel Proxy Server running on port ${PORT}`);
  console.log(`Account SID: ${ACCOUNT_SID}`);
  console.log(`API Key: ${API_KEY?.substring(0, 10)}...`);
  console.log(`=================================`);
});
