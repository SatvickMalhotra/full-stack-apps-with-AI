// server/index.js
const express = require("express");
const axios = require("axios");
const querystring = require("querystring"); // Node core
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors()); // allow all in dev. You can restrict to http://localhost:3000 if needed

const EXO_API_KEY = process.env.EXO_API_KEY;
const EXO_API_TOKEN = process.env.EXO_API_TOKEN;
const EXO_SUBDOMAIN = process.env.EXO_SUBDOMAIN || "api.exotel.com";

const exoBase = `https://${EXO_SUBDOMAIN}`;

// Health
app.get("/health", (req, res) => res.json({ ok: true }));

// GET incoming phones (proxy)
app.get("/v2/accounts/:account/incoming-phone-numbers", async (req, res) => {
  const account = req.params.account;
  try {
    const resp = await axios.get(`${exoBase}/v2/accounts/${account}/incoming-phone-numbers`, {
      auth: { username: EXO_API_KEY, password: EXO_API_TOKEN },
    });
    // forward Exotel response JSON
    return res.status(resp.status).send(resp.data);
  } catch (err) {
    console.error("Exotel GET error:", err.response?.status, err.response?.data || err.message);
    const status = err.response?.status || 500;
    return res.status(status).json({ error: err.response?.data || err.message });
  }
});

// POST connect call (proxy)
app.post("/v1/Accounts/:account/Calls/connect", async (req, res) => {
  const account = req.params.account;
  // expect { From, To, CallerId } from frontend
  try {
    const body = querystring.stringify(req.body);
    const resp = await axios.post(
      `${exoBase}/v1/Accounts/${account}/Calls/connect`,
      body,
      {
        auth: { username: EXO_API_KEY, password: EXO_API_TOKEN },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        responseType: "text", // Exotel sometimes returns XML
      }
    );
    // forward raw response (could be XML)
    res.status(resp.status).send(resp.data);
  } catch (err) {
    console.error("Exotel POST error:", err.response?.status, err.response?.data || err.message);
    const status = err.response?.status || 500;
    return res.status(status).json({ error: err.response?.data || err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Exotel proxy running at http://localhost:${PORT}`));
