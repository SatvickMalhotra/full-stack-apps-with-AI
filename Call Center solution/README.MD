<div align="center">
  <img width="100%" alt="banner"
       src="https://capsule-render.vercel.app/api?type=waving&color=0:0F172A,40:1E293B,100:0EA5E9&height=200&section=header&text=Call%20Center%20Solution&fontSize=50&fontColor=ffffff&animation=fadeIn&fontAlignY=40&desc=End-to-end%20call%20ops%20%E2%80%94%20calls%2C%20incentives%2C%20field%20tracking&descSize=16&descAlignY=68&descAlign=50" />
</div>

<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Instrument+Serif&italic=true&size=26&duration=2800&pause=700&color=7DD3FC&center=true&vCenter=true&width=720&height=50&lines=Track+every+call%2C+every+agent;Incentives+%C2%B7+attendance+%C2%B7+field+trips;Agent+%E2%86%92+TL+%E2%86%92+Manager+%E2%86%92+Admin+roles" />
</div>

<div align="center">
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Exotel-FF6C37?style=for-the-badge&labelColor=0F172A" />
  <img src="https://img.shields.io/badge/Material_UI-007FFF?style=for-the-badge&logo=mui&logoColor=white" />
</div>

<br />

An end-to-end **call-center management system** for sales teams to track calls, performance, incentives, and field activity.

## 📌 Overview

Built for companies with multiple sales teams (Insurance, Health Managers, Sales) who live on the phone. It tracks:

- ☎️ **Call performance** — inbound/outbound logs + analytics
- 👤 **Agent activity** — status, daily tasks, productivity
- 💰 **Incentives & bonuses** — auto-calculated
- 📍 **Field movement** — travel + work-location tracking
- 🕒 **Attendance** — geo-tagged punch in/out

## ✨ Features by role

| Role | Gets |
|---|---|
| **Agent** | Call logging, daily tasks, punch in/out, trip tracking, offline visit recording |
| **Team Leader** | Team dashboard, agent monitoring, call assignment, live team status |
| **Manager** | Department analytics, multi-team oversight, reports, incentive tracking |
| **Admin** | User management, team/department config, system analytics, ExoPhone management |

## 🧱 Tech Stack

**Frontend** React 19 · Material UI · Recharts &nbsp;|&nbsp; **Backend** Node.js · Express &nbsp;|&nbsp; **DB/Auth** Firebase Firestore + Auth &nbsp;|&nbsp; **Calling** Exotel &nbsp;|&nbsp; **Hosting** Firebase

## 🚀 Run it locally

```bash
cd "Call Center solution"

# 1. Install web + functions deps
npm install
cd functions && npm install && cd ..

# 2. Add your Firebase + Exotel credentials
#    (firebase.json + functions config)

# 3. Run locally with Firebase emulators
firebase emulators:start

# 4. Deploy
firebase deploy
```

**Prerequisites:** Node 18+ · Firebase CLI (`npm i -g firebase-tools`) · Exotel account for live calling.

<br />

<div align="center">
  <a href="https://github.com/SatvickMalhotra/full-stack-apps-with-AI"><img src="https://img.shields.io/badge/%E2%86%90_All_Vibe--Coded_Apps-0EA5E9?style=for-the-badge&labelColor=0F172A" /></a>
  <a href="https://github.com/SatvickMalhotra"><img src="https://img.shields.io/badge/%F0%9F%91%A4_Satvick_Malhotra-181717?style=for-the-badge&labelColor=0F172A" /></a>
</div>

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:0EA5E9,50:1E293B,100:0F172A&height=120&section=footer&animation=fadeIn" />
