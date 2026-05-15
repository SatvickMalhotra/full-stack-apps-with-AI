<div align="center">
  <img width="100%" alt="banner"
       src="https://capsule-render.vercel.app/api?type=waving&color=0:0F172A,40:1E293B,100:0EA5E9&height=200&section=header&text=MapMyClinic&fontSize=54&fontColor=ffffff&animation=fadeIn&fontAlignY=40&desc=5%2C000%20clinics%20across%20India%20%E2%80%94%20on%20one%20map&descSize=16&descAlignY=68&descAlign=50" />
</div>

<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Instrument+Serif&italic=true&size=26&duration=2800&pause=700&color=7DD3FC&center=true&vCenter=true&width=720&height=50&lines=Find+any+clinic+%C2%B7+filter+by+state%2Fregion;Nearest-clinic+from+your+location;Get+directions+in+one+tap+%F0%9F%97%BA" />
</div>

<div align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Maps-4285F4?style=for-the-badge&logo=googlemaps&logoColor=white" />
</div>

<br />

A comprehensive **clinic-locator map** built for a client with **5,000 clinics across India** — find clinics, filter by state/region, view details, and get directions.

## ✨ Features

- 🗺 **Clinic map** — all clinics plotted across India (`index.html`)
- 🔍 **Filter** — by state + region
- 📍 **Nearest clinic** — uses your location (`map2.html`)
- 🧭 **Directions** — one tap from the map
- 🔐 **Admin** — edit clinic info, toggle active/inactive (`admin.html`)

## 🧱 Tech Stack

HTML/JS map UI · Google Maps · Firebase (clinic data) · Python (`Firebase_connection.py`) for bulk data sync

## 🚀 Run it locally

```bash
cd "MapMyClinic"

# Add Firebase + Maps API keys in the HTML files, then open:
start index.html        # main map         (Windows)
start MAP2.HTML         # nearest-clinic
start ADMIN.HTML        # admin editor
# macOS: use `open`

# Bulk-load clinic data into Firebase:
python Firebase_connection.py
```

<br />

<div align="center">
  <a href="https://github.com/SatvickMalhotra/full-stack-apps-with-AI"><img src="https://img.shields.io/badge/%E2%86%90_All_Vibe--Coded_Apps-0EA5E9?style=for-the-badge&labelColor=0F172A" /></a>
  <a href="https://github.com/SatvickMalhotra"><img src="https://img.shields.io/badge/%F0%9F%91%A4_Satvick_Malhotra-181717?style=for-the-badge&labelColor=0F172A" /></a>
</div>

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:0EA5E9,50:1E293B,100:0F172A&height=120&section=footer&animation=fadeIn" />
