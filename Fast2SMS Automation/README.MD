# Fast2SMS‑DLT Bulk Sender 🛰️

A one‑file Python/Colab utility to send **personalised, DLT‑compliant SMS** through the Fast2SMS Dev API.   
It pulls your approved templates, builds a sample CSV, validates variables, respects operator rate limits, retries soft failures, polls delivery reports, and aborts if wallet balance falls below ₹ 1 000.

---

## ✨ Features
| ✔ | Description |
|---|-------------|
| **Template sync** | Fetches live template list via `/dlt_manager` so `var_count` and sender‑ID stay in sync with your Fast2SMS dashboard. :contentReference[oaicite:0]{index=0} |
| **Wallet guard** | Calls `/wallet` and refuses to start if balance < ₹ 1 000. :contentReference[oaicite:1]{index=1} |
| **CSV generator & validator** | Exports `sample_<ID>.csv` (`mobile,v1..vN`); checks missing cols on upload. |
| **Per‑row POST** | One API call per recipient → each gets the right variable pipe string (`v1|v2|…`). :contentReference[oaicite:2]{index=2} |
| **Unicode auto‑flag** | Adds `language:"unicode"` when template text includes Hindi/emoji so characters render correctly. :contentReference[oaicite:3]{index=3} |
| **Retry + throttle** | 3 attempts / row, exponential back‑off, sleeps ≈ 1 req s‑¹ to stay under Fast2SMS rate limits. :contentReference[oaicite:4]{index=4} |
| **Delivery poller** | Hits `/report` until every mobile reaches a final state (Delivered / Rejected‑DND / …). :contentReference[oaicite:5]{index=5} |
| **CTA whitelist note** | Warns & links to TRAI “CTA_URL_NOT_MATCHED” rule so ops add base URLs on the DLT portal. :contentReference[oaicite:6]{index=6} |
| **Low‑code** | Pure Python; runs in Google Colab, Jupyter, or vanilla `python bulk_send.py`. |

---

## 🚀 Quick start

```
bash
pip install requests pandas openpyxl
export FAST2SMS_KEY="<your‑key>"
python bulk_send.py       # or run each cell in Colab
Pick a Message‑ID from the printed allow‑list.

Download the auto‑generated CSV, fill mobile,v1…vN, re‑upload.

Flip DRY_RUN=False, run Send cell → watch OK <row> <request_id>.

The script polls until each handset shows a final operator code.

```

#  Operational safeguards
- Wallet ≥ ₹ 1 000 → starts; else exits ⛔. 
- Rate limit – sleeps 0.9 s between calls per Fast2SMS throttling guidance (“few requests per second”).
- CTA URL – every base path (link) must be whitelisted as Dynamic in your operator DLT portal, else operators return CTA_URL_NOT_MATCHED
- Route choice – keep policy & OTP alerts on Service‑Implicit or OTP route; promos on Service‑Explicit. 
