<div align="center">
  <img width="100%" alt="banner"
       src="https://capsule-render.vercel.app/api?type=waving&color=0:0F172A,40:1E293B,100:0EA5E9&height=200&section=header&text=WhatsApp%20Automation&fontSize=48&fontColor=ffffff&animation=fadeIn&fontAlignY=40&desc=Bulk%20templated%20WhatsApp%20%E2%80%94%20Python%20%2B%20API&descSize=16&descAlignY=68&descAlign=50" />
</div>

<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Instrument+Serif&italic=true&size=26&duration=2800&pause=700&color=7DD3FC&center=true&vCenter=true&width=720&height=50&lines=Templated+WhatsApp+at+scale;Bring+a+database+%2B+an+API+key;Everything+else+is+in+the+code+%F0%9F%92%AC" />
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/WhatsApp_API-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" />
  <img src="https://img.shields.io/badge/Automation-F97316?style=for-the-badge&labelColor=0F172A" />
</div>

<br />

A Python toolkit to **automate WhatsApp messaging at scale** — templated, database-driven sends. Bring a contact database + an API key; the rest of the plumbing is already here.

## ✨ What's inside

| File | Role |
|---|---|
| `whatsapp.py` | Main send engine |
| `whatsapptemplates.py` | Message template definitions |
| `whatsapptesting.py` | Dry-run / test harness |
| `test.py` | Quick sanity tests |
| `minsureconfig.py` | Config (API keys, endpoints, DB) |

## 🚀 Run it

```bash
cd "WhatsApp Message Automation"
pip install -r requirements.txt   # or: pip install requests pandas

# 1. Fill in minsureconfig.py  (API key, DB connection, sender)
# 2. Define / edit templates in whatsapptemplates.py
# 3. Dry-run first
python whatsapptesting.py

# 4. Go live
python whatsapp.py
```

> Keep API keys out of git — put them in `minsureconfig.py` and add it to `.gitignore` before pushing anywhere public.

<br />

<div align="center">
  <a href="https://github.com/SatvickMalhotra/full-stack-apps-with-AI"><img src="https://img.shields.io/badge/%E2%86%90_All_Vibe--Coded_Apps-0EA5E9?style=for-the-badge&labelColor=0F172A" /></a>
  <a href="https://github.com/SatvickMalhotra"><img src="https://img.shields.io/badge/%F0%9F%91%A4_Satvick_Malhotra-181717?style=for-the-badge&labelColor=0F172A" /></a>
</div>

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:0EA5E9,50:1E293B,100:0F172A&height=120&section=footer&animation=fadeIn" />
