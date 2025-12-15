# Analytics360

A high-performance business intelligence dashboard for tracking company performance metrics at scale. Built to handle millions of rows of data while delivering instant insights through beautiful visualizations.

## Overview

Analytics360 is designed for organizations that need to analyze large volumes of operational data without expensive BI tools. The system uses a smart architecture where Python scripts pre-process millions of records into optimized JSON files, which are then consumed by a lightning-fast React dashboard.

### Key Benefits

- **Cost Efficient** - No expensive BI tool subscriptions required
- **Handles Scale** - Process millions of rows without performance issues
- **Real-time Filtering** - Instant filter responses on large datasets
- **Beautiful UI** - Modern, animated interface with multiple themes
- **Self-Hosted** - Full control over your data and infrastructure

## Features

### Dashboard Analytics
- **KPI Cards** - Total Clinics, Active Policies, Total Policies, Consultations, States, Channels
- **Interactive Charts** - Bar charts and Pie charts with drill-down capabilities
- **Data Tables** - Sortable, searchable tables with virtual scrolling for performance

### Advanced Filtering
- Multi-select filters for State, Channel, Branch, Pin Code
- Extra filters: Clinic Type, Region, TL Name, Nurse Name, DC Name, Status
- Real-time filter results with instant updates

### Master Portal (Admin)
- Password-protected admin section
- Branch Mapping management with expandable rows
- Map Locator data management
- Inline editing with auto-save to Firebase

### Themes
Choose from 5 beautiful themes:
- Normal (Default)
- Retro
- Batman (Dark)
- Flowers
- Medical

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 19, TypeScript |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 4 |
| State Management | Zustand |
| Charts | ECharts |
| Tables | TanStack Table + Virtual |
| Animations | Framer Motion |
| Database | Firebase Firestore |
| Data Processing | Python (for large dataset analysis) |

## Architecture

```
                    ┌─────────────────┐
                    │  Raw Data       │
                    │  (Millions of   │
                    │   rows)         │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Python Scripts │
                    │  (analyze-data) │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Firebase       │
                    │  Firestore      │
                    │  (Optimized)    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  React Dashboard│
                    │  (Analytics360) │
                    └─────────────────┘
```

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── charts/         # ECharts visualizations
│   │   │   ├── BarChart.tsx
│   │   │   ├── PieChart.tsx
│   │   │   └── ChartWrapper.tsx
│   │   ├── filters/        # Filter panel components
│   │   │   └── FilterPanel.tsx
│   │   ├── kpi/            # KPI card components
│   │   │   ├── KpiCard.tsx
│   │   │   └── KpiGrid.tsx
│   │   ├── layout/         # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── LoadingScreen.tsx
│   │   │   └── ThemeSwitcher.tsx
│   │   ├── master/         # Admin portal
│   │   │   └── MasterPortal.tsx
│   │   ├── modals/         # Modal components
│   │   │   └── KpiDetailModal.tsx
│   │   └── table/          # Data table
│   │       └── DataTable.tsx
│   ├── stores/             # Zustand state stores
│   │   ├── dataStore.ts    # Data & filter state
│   │   └── themeStore.ts   # Theme state
│   ├── themes/             # Theme configurations
│   ├── types/              # TypeScript types
│   ├── config/             # Firebase config
│   └── App.tsx             # Main application
├── public/                 # Static assets
├── analyze-data.cjs        # Node.js data analysis script
└── package.json
```

## Data Models

### Branch Mapping
```typescript
interface BranchMapping {
  clinicCode: string;
  channelName: string;
  branchName: string;
  pinCode: string;
  state: string;
  activeBase: number;    // Active policies count
  totalBase: number;     // Total policies count
  consultation: number;  // Consultation count
}
```

### Map Locator
```typescript
interface MapLocator {
  clinicCode: string;
  clinicAddress: string;
  clinicType: string;
  state: string;
  region: string;
  partnerName: string;
  tlName: string;
  nurseName: string;
  dcName: string;
  status: string;
  latitude: number;
  longitude: number;
}
```

## Getting Started

### Prerequisites
- Node.js 18+
- Firebase account
- Python 3.x (for data processing scripts)

### Installation

1. Clone the repository
```bash
git clone https://github.com/SatvickMalhotra/full-stack-apps-with-AI.git
cd "Analytics360 (Dashboard on company performance)"
```

2. Install dependencies
```bash
npm install
```

3. Configure Firebase
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database
   - Update `src/config/firebase.ts` with your credentials

4. Start development server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Data Processing

For large datasets, use the analysis scripts:

```bash
# Analyze data and populate Firestore
node analyze-data.cjs
```

This script:
- Connects to Firebase Admin SDK
- Fetches and analyzes branchMapping collection
- Generates insights on data quality
- Helps identify missing or inconsistent data

## Performance Optimizations

1. **Virtual Scrolling** - TanStack Virtual renders only visible rows
2. **Memoized Computations** - Heavy calculations cached with useMemo
3. **Optimistic Updates** - UI updates immediately, syncs in background
4. **Lazy Loading** - Components load on demand
5. **Pre-computed Aggregates** - KPIs calculated once, not on every render

## Screenshots

### Dashboard View
- KPI cards with animated counters
- Interactive charts with tooltips
- Collapsible filter sidebar

### Master Portal
- Grouped clinic view with expandable entries
- Inline editing with auto-save
- Map locator management

## License

Private - Internal Use Only

## Author

Built with AI assistance for M-SWASTH healthcare operations.
