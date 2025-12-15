// API Configuration for both development and production

const isProduction = process.env.NODE_ENV === 'production';

// For production, use Firebase Functions URL
// For development, use local Express server
const API_BASE_URL = isProduction
  ? 'https://us-central1-agent-status-b9204.cloudfunctions.net/exotelProxy'
  : 'http://localhost:3001/api/exotel';

export default API_BASE_URL;
