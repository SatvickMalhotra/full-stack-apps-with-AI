<div align="center">
  <img width="100%" alt="banner"
       src="https://capsule-render.vercel.app/api?type=waving&color=0:0F172A,40:1E293B,100:0EA5E9&height=200&section=header&text=Doctor%20Onboarding&fontSize=50&fontColor=ffffff&animation=fadeIn&fontAlignY=40&desc=Self-hosted%20registration%20%E2%86%92%20Sheets%20%2B%20Drive&descSize=16&descAlignY=68&descAlign=50" />
</div>

<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Instrument+Serif&italic=true&size=26&duration=2800&pause=700&color=7DD3FC&center=true&vCenter=true&width=720&height=50&lines=Register+doctors+in+one+slick+form;Auto-files+docs+into+Drive+folders;Particle+background%2C+zero+backend+%F0%9F%A9%BA" />
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Google_Apps_Script-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_Sheets-34A853?style=for-the-badge&logo=googlesheets&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_Drive-4285F4?style=for-the-badge&logo=googledrive&logoColor=white" />
  <img src="https://img.shields.io/badge/particles.js-000000?style=for-the-badge&labelColor=0F172A" />
</div>

<br />

A comprehensive, **self-hosted doctor-registration web app** built entirely on Google Apps Script — a polished form that captures detailed info + documents, then auto-organizes everything into a Google Sheet and a structured Drive folder per doctor.

## ✨ Features

- 🎨 **Dynamic form** — responsive, animated particle background
- 📋 **Captures** basic/personal, contact/address, bank, employment, medical qualifications
- 🔀 **Conditional logic** — PwD selection reveals a mandatory certificate upload
- 📎 **Secure uploads** — Aadhaar, PAN, photo, passbook, certificates
- 🗂 **Auto storage** — new Sheet row + a uniquely-named Drive folder (`Doctor Name_Code_Docs`) per submission
- ⏳ **Real-time feedback** — loading states + success/error alerts

## 🧱 Tech Stack

Google Apps Script (`SpreadsheetApp`, `DriveApp`) · HTML5 · CSS3 · JS (`async/await`, `FileReader`) · particles.js

## 🚀 Deploy it

```text
1. script.google.com → New project
2. Paste Code.js  +  add Index.html as an HTML file
3. Set parent Drive folder ID + target Sheet ID in Code.js
4. Deploy → New deployment → "Web app"
5. Execute as: Me  ·  Access: Anyone (or your org)
6. Share the /exec URL — that's the live registration form
```

<br />

<div align="center">
  <a href="https://github.com/SatvickMalhotra/full-stack-apps-with-AI"><img src="https://img.shields.io/badge/%E2%86%90_All_Vibe--Coded_Apps-0EA5E9?style=for-the-badge&labelColor=0F172A" /></a>
  <a href="https://github.com/SatvickMalhotra"><img src="https://img.shields.io/badge/%F0%9F%91%A4_Satvick_Malhotra-181717?style=for-the-badge&labelColor=0F172A" /></a>
</div>

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:0EA5E9,50:1E293B,100:0F172A&height=120&section=footer&animation=fadeIn" />
