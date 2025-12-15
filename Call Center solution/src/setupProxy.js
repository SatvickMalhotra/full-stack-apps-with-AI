const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const API_KEY = process.env.REACT_APP_API_KEY;
  const API_TOKEN = process.env.REACT_APP_API_TOKEN;
  const SUBDOMAIN = process.env.REACT_APP_SUBDOMAIN || 'api.exotel.com';

  const proxyConfig = {
    target: `https://${SUBDOMAIN}`,
    changeOrigin: true,
    secure: false,
    logLevel: 'debug',
    pathRewrite: {
      '^/exotel': '', // Remove /exotel prefix when forwarding to API
    },
    onProxyReq: (proxyReq, req, res) => {
      // Add Basic Authentication header
      const auth = Buffer.from(`${API_KEY}:${API_TOKEN}`).toString('base64');
      proxyReq.setHeader('Authorization', `Basic ${auth}`);

      // Remove any headers that might interfere
      proxyReq.removeHeader('origin');
      proxyReq.removeHeader('referer');

      // Set Accept header to accept both XML and JSON
      proxyReq.setHeader('Accept', 'application/xml, application/json, */*');

      console.log('=== Proxy Request Details ===');
      console.log('Original path:', req.path);
      console.log('Proxied path:', proxyReq.path);
      console.log('Target:', `https://${SUBDOMAIN}${proxyReq.path}`);
      console.log('Method:', proxyReq.method);
      console.log('Headers:', proxyReq.getHeaders());
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log('=== Proxy Response ===');
      console.log('Status:', proxyRes.statusCode);
      console.log('Headers:', proxyRes.headers);
    },
    onError: (err, req, res) => {
      console.error('=== Proxy Error ===');
      console.error('Error:', err);
    },
  };

  app.use('/exotel', createProxyMiddleware(proxyConfig));
};
