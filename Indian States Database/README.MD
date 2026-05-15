<div align="center">
  <img width="100%" alt="banner"
       src="https://capsule-render.vercel.app/api?type=waving&color=0:0F172A,40:1E293B,100:0EA5E9&height=200&section=header&text=Indian%20Postal%20Database&fontSize=46&fontColor=ffffff&animation=fadeIn&fontAlignY=40&desc=Every%20post%20office%20in%20India%20%E2%80%94%20with%20geo-coordinates&descSize=16&descAlignY=68&descAlign=50" />
</div>

<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Instrument+Serif&italic=true&size=26&duration=2800&pause=700&color=7DD3FC&center=true&vCenter=true&width=720&height=50&lines=Pincode+%E2%86%92+lat%2Flng+for+all+of+India;Full+postal+hierarchy%2C+clean+CSV;Drop-in+for+logistics+%26+geo+apps+%F0%9F%87%AE%F0%9F%87%B3" />
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Format-CSV-3FCF8E?style=for-the-badge&labelColor=0F172A" />
  <img src="https://img.shields.io/badge/Records-150k%2B-F97316?style=for-the-badge&labelColor=0F172A" />
  <img src="https://img.shields.io/badge/Geo-lat%2Flng-7DD3FC?style=for-the-badge&labelColor=0F172A" />
  <img src="https://img.shields.io/badge/License-MIT-0EA5E9?style=for-the-badge&labelColor=0F172A" />
</div>

<br />

A detailed, structured dataset of **all postal offices across India** — location, full hierarchy, and precise latitude/longitude. A go-to resource for developers, data scientists, and businesses needing accurate Indian postal data.

## 📁 Columns

| Column | Description | Example |
|---|---|---|
| `circlename` | Top-level postal circle (≈ state) | `Maharashtra Circle` |
| `regionname` | Postal region within a circle | `Mumbai` |
| `divisionname` | Postal division within a region | `Mumbai North East` |
| `officename` | Official post-office name | `Bhandup West S.O` |
| `pincode` | 6-digit PIN (primary lookup key) | `400078` |
| `officetype` | `HO` / `SO` / `BO` | `SO` |
| `delivery` | Delivery / Non-Delivery | `Delivery` |
| `district` | Administrative district | `Mumbai` |
| `statename` | State / UT | `MAHARASHTRA` |
| `latitude` / `longitude` | Geo-coordinates (may be `NA`) | `19.1593` / `72.9339` |

## 💡 Use it

```python
import pandas as pd

df = pd.read_csv("5c2f62fe-5afa-4119-a499-fec9d604d5bd.csv")

# Pincode → location
df[df.pincode == 400078][["officename", "district", "statename"]]

# Everything in a state, with coordinates
mh = df[df.statename == "MAHARASHTRA"].dropna(subset=["latitude", "longitude"])
```

**Powers:** pincode serviceability checks · nearest-branch / distance analysis · address autocomplete · geo-clustering · logistics routing.

<br />

<div align="center">
  <a href="https://github.com/SatvickMalhotra/full-stack-apps-with-AI"><img src="https://img.shields.io/badge/%E2%86%90_All_Vibe--Coded_Apps-0EA5E9?style=for-the-badge&labelColor=0F172A" /></a>
  <a href="https://github.com/SatvickMalhotra"><img src="https://img.shields.io/badge/%F0%9F%91%A4_Satvick_Malhotra-181717?style=for-the-badge&labelColor=0F172A" /></a>
</div>

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:0EA5E9,50:1E293B,100:0F172A&height=120&section=footer&animation=fadeIn" />
