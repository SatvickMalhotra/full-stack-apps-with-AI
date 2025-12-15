# Call Center Solution

An end-to-end call center management system for sales teams to track calls, performance, incentives, and field activities.

## Overview

This application is designed for companies with multiple sales teams (Insurance, Health Managers, Sales) who use calling as their primary mode of customer engagement. The system provides comprehensive tracking of:

- **Call Performance** - Track all inbound/outbound calls, call logs, and call analytics
- **Agent Activity** - Monitor agent status, daily tasks, and productivity
- **Incentives & Bonuses** - Track and calculate sales incentives
- **Field Movement** - Track sales representatives' travel and work locations
- **Attendance** - Punch in/out system with location tracking

## Features

### For Agents
- Call logging and history
- Daily task management
- Punch in/out with location
- Trip tracking for field visits
- Offline visit recording

### For Team Leaders
- Team performance dashboard
- Agent monitoring and analytics
- Call assignment management
- Real-time team status

### For Managers
- Department-wide analytics
- Multi-team oversight
- Performance reports
- Incentive tracking

### For Admins
- User management
- Team & department configuration
- System-wide analytics
- ExoPhone management

## Tech Stack

- **Frontend:** React 19, Material UI, Recharts
- **Backend:** Node.js, Express.js
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Calling Integration:** Exotel
- **Hosting:** Firebase Hosting

## Project Structure

```
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── Admin*.js    # Admin dashboards & management
│   │   ├── Agent*.js    # Agent views
│   │   ├── TL*.js       # Team Leader dashboards
│   │   ├── Manager*.js  # Manager dashboards
│   │   ├── Health*.js   # Health team dashboards
│   │   ├── Insurance*.js# Insurance team dashboards
│   │   ├── DC*.js       # DC (Distributor/Clinic) views
│   │   ├── Call*.js     # Call management components
│   │   ├── Offline*.js  # Offline visit tracking
│   │   ├── Trip*.js     # Trip/travel tracking
│   │   └── PunchInOut*  # Attendance components
│   ├── config/          # Configuration files
│   ├── hooks/           # Custom React hooks
│   ├── theme/           # MUI theme customization
│   └── utils/           # Utility functions
├── server/              # Backend server code
├── functions/           # Firebase Cloud Functions
├── firebase-admin/      # Firebase Admin SDK utilities
└── firebase.json        # Firebase configuration
```

## Getting Started

### Prerequisites
- Node.js 18+
- Firebase CLI
- Exotel account (for calling features)

### Installation

1. Clone the repository
```bash
git clone https://github.com/SatvickMalhotra/full-stack-apps-with-AI.git
cd "Call Center solution"
```

2. Install dependencies
```bash
npm install
```

3. Configure Firebase
   - Create a Firebase project
   - Update `src/firebaseConfig.js` with your credentials

4. Start development server
```bash
npm start
```

### Build for Production
```bash
npm run build
```

### Deploy to Firebase
```bash
firebase deploy
```

## User Roles

| Role | Access Level |
|------|-------------|
| Admin | Full system access, user management |
| Department Manager | Department-wide analytics and management |
| Team Leader | Team performance and agent management |
| Health Manager | Health team specific dashboard |
| Insurance Manager | Insurance team specific dashboard |
| Agent | Personal dashboard, call logging, attendance |
| DC | Clinic/distributor specific views |

## License

Private - Internal Use Only
