<div align="center">
  <img width="100%" alt="banner"
       src="https://capsule-render.vercel.app/api?type=waving&color=0:0F172A,40:1E293B,100:0EA5E9&height=200&section=header&text=Analytics360&fontSize=58&fontColor=ffffff&animation=fadeIn&fontAlignY=40&desc=Million-row%20BI%20dashboard%20%E2%80%94%20zero%20BI-tool%20cost&descSize=17&descAlignY=68&descAlign=50" />
</div>

<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Instrument+Serif&italic=true&size=26&duration=2800&pause=700&color=7DD3FC&center=true&vCenter=true&width=720&height=50&lines=Millions+of+rows+%E2%86%92+instant+insight;Python+pre-processes+%C2%B7+React+flies;5+themes%2C+1+lightning-fast+dashboard+%E2%9A%A1" />
</div>

<div align="center">
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite_7-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/ECharts-AA344D?style=for-the-badge&logo=apacheecharts&logoColor=white" />
</div>

<br />

A high-performance business-intelligence dashboard for tracking company performance metrics **at scale** — built to handle millions of rows while delivering instant insight through beautiful visualizations.

## 📌 Overview

Analytics360 is for organizations that need to analyze large volumes of operational data **without expensive BI tools**. Python scripts pre-process millions of records into optimized data, consumed by a lightning-fast React dashboard.

- 💸 **Cost efficient** — no BI-tool subscriptions
- 📈 **Handles scale** — millions of rows, no lag
- ⚡ **Real-time filtering** — instant on huge datasets
- 🎨 **5 themes** — Normal · Retro · Batman · Flowers · Medical
- 🔒 **Self-hosted** — full control over data + infra

## ✨ Features

**Dashboard** — KPI cards (Clinics, Policies, Consultations, States, Channels) · interactive Bar/Pie charts with drill-down · sortable, virtual-scrolled data tables.

**Advanced filtering** — multi-select State/Channel/Branch/Pin + Clinic Type, Region, TL/Nurse/DC name, Status, with instant results.

**Master Portal (admin)** — password-protected · branch-mapping management · map-locator data · inline editing with Firebase auto-save.

## 🧱 Tech Stack

| Category | Technology |
|---|---|
| Frontend | React 19 · TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| State | Zustand |
| Charts | ECharts |
| Tables | TanStack Table + Virtual |
| Animation | Framer Motion |
| Database | Firebase Firestore |
| Data processing | Python / Node |

## 🏗 Architecture

```
Raw data (millions of rows)
        │
        ▼
Python / Node pre-processing  (analyze-data.cjs)
        │
        ▼
Firebase Firestore  (optimized)
        │
        ▼
React dashboard  (Analytics360)
```

## 🚀 Run it locally

```bash
# 1. Enter the folder
cd "Analytics360 (Dashboard on company performance)"

# 2. Install dependencies
npm install

# 3. Configure Firebase
#    Create a project at console.firebase.google.com,
#    enable Firestore, then update src/config/firebase.ts

# 4. Start the dev server
npm run dev

# Build for production
npm run build && npm run preview

# (Optional) populate / audit Firestore from raw data
node analyze-data.cjs
```

**Prerequisites:** Node 18+ · Firebase account · Python 3.x (for the data scripts)

## ⚡ Performance tricks

Virtual scrolling (TanStack) · memoized heavy computations · optimistic UI updates · lazy-loaded components · pre-computed KPI aggregates.

<br />

<div align="center">
  <a href="https://github.com/SatvickMalhotra/full-stack-apps-with-AI"><img src="https://img.shields.io/badge/%E2%86%90_All_Vibe--Coded_Apps-0EA5E9?style=for-the-badge&labelColor=0F172A" /></a>
  <a href="https://github.com/SatvickMalhotra"><img src="https://img.shields.io/badge/%F0%9F%91%A4_Satvick_Malhotra-181717?style=for-the-badge&labelColor=0F172A" /></a>
</div>

<sub align="center"><div align="center"><em>Built with AI assistance for M-SWASTH healthcare operations · Private / internal use</em></div></sub>

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:0EA5E9,50:1E293B,100:0F172A&height=120&section=footer&animation=fadeIn" />
