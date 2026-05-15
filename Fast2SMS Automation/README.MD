<div align="center">
  <img width="100%" alt="banner"
       src="https://capsule-render.vercel.app/api?type=waving&color=0:0F172A,40:1E293B,100:0EA5E9&height=200&section=header&text=Fast2SMS%20Bulk%20Sender&fontSize=48&fontColor=ffffff&animation=fadeIn&fontAlignY=40&desc=DLT-compliant%20personalised%20SMS%20%E2%80%94%20one%20Python%20file&descSize=16&descAlignY=68&descAlign=50" />
</div>

<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Instrument+Serif&italic=true&size=26&duration=2800&pause=700&color=7DD3FC&center=true&vCenter=true&width=720&height=50&lines=Personalised+%C2%B7+DLT-compliant+%C2%B7+bulk;Wallet+guard+%C2%B7+retries+%C2%B7+delivery+poller;Runs+in+Colab%2C+Jupyter+or+plain+Python+%F0%9F%9B%B0" />
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Fast2SMS_API-FF6C37?style=for-the-badge&labelColor=0F172A" />
  <img src="https://img.shields.io/badge/Google_Colab-F9AB00?style=for-the-badge&logo=googlecolab&logoColor=white" />
  <img src="https://img.shields.io/badge/DLT-compliant-3FCF8E?style=for-the-badge&labelColor=0F172A" />
</div>

<br />

A one-file Python utility to send **personalised, DLT-compliant SMS** through the Fast2SMS Dev API. It syncs your approved templates, builds a sample CSV, validates variables, respects operator rate-limits, retries soft failures, polls delivery reports, and aborts if wallet balance drops below ₹1,000.

## ✨ Features

| ✔ | Description |
|---|---|
| **Template sync** | Pulls live template list so `var_count` + sender-ID stay in sync |
| **Wallet guard** | Refuses to start if balance < ₹1,000 |
| **CSV generator + validator** | Exports `sample_<ID>.csv`, checks missing columns on upload |
| **Per-row POST** | One API call per recipient with the right `v1\|v2\|…` variables |
| **Unicode auto-flag** | Adds `language:"unicode"` for Hindi/emoji templates |
| **Retry + throttle** | 3 attempts/row, exponential back-off, ~1 req/s |
| **Delivery poller** | Polls `/report` until every number reaches a final state |

## 🚀 Run it

```bash
cd "Fast2SMS Automation"
pip install requests pandas openpyxl
export FAST2SMS_KEY="<your-key>"     # set your Fast2SMS dev key

python code.py                        # or run cells in Google Colab
```

Then: pick a Message-ID from the printed allow-list → download the auto-generated CSV → fill `mobile,v1…vN` → re-upload → flip `DRY_RUN=False` → send. The script polls until each handset shows a final operator code.

## 🛡 Operational safeguards

- Wallet ≥ ₹1,000 to start, else exits ⛔
- Sleeps 0.9s between calls (Fast2SMS throttle guidance)
- Every CTA base URL must be whitelisted as **Dynamic** on your operator DLT portal
- Keep policy/OTP alerts on Service-Implicit/OTP route; promos on Service-Explicit

<br />

<div align="center">
  <a href="https://github.com/SatvickMalhotra/full-stack-apps-with-AI"><img src="https://img.shields.io/badge/%E2%86%90_All_Vibe--Coded_Apps-0EA5E9?style=for-the-badge&labelColor=0F172A" /></a>
  <a href="https://github.com/SatvickMalhotra"><img src="https://img.shields.io/badge/%F0%9F%91%A4_Satvick_Malhotra-181717?style=for-the-badge&labelColor=0F172A" /></a>
</div>

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:0EA5E9,50:1E293B,100:0F172A&height=120&section=footer&animation=fadeIn" />
