# MilestoneTracker

A central hub for project management inspired by Bitbucket/Jira. Track projects, phases, milestones, and team collaboration all in one place with a beautiful, modern interface.

## Overview

MilestoneTracker is designed for teams that need a simple yet powerful way to track project progress without the complexity of enterprise tools. It features a phase-based timeline, team collaboration through comments and notes, and role-based access control.

### Key Highlights

- **Phase-Based Timeline** - Visual project phases with status tracking
- **Team Collaboration** - Comments and notes per phase
- **Role-Based Access** - Managers vs Team Members permissions
- **Dark/Light Mode** - Beautiful themed interface
- **Real-time Updates** - Instant UI updates on changes

## Features

### Dashboard
- Welcome message with user context
- Ongoing projects section
- Future projects section
- Project status chart (pie/donut visualization)
- Quick project creation (Managers only)

### Project Details
- Project header with metadata
- Visual timeline with clickable phases
- Phase status indicators (Pending, Ongoing, Completed)
- Phase-specific chat/comments
- Phase-specific notes
- Global project notes
- Quick links section
- Team contacts

### Role-Based Access Control
| Feature | Manager | Team Member |
|---------|---------|-------------|
| Create Projects | Yes | No |
| Edit Project | Yes | No |
| Add Links | Yes | No |
| Add Comments | Yes | Yes |
| Add Notes | Yes | Yes |
| View Projects | Yes | Yes |

### Themes
- Light mode (default)
- Dark mode
- Smooth transitions between themes

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 19, TypeScript |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 3 |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| Date Handling | date-fns |

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   └── DeleteConfirmationModal.tsx
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx        # Main dashboard view
│   │   │   ├── ProjectCard.tsx      # Project card component
│   │   │   ├── StatsChart.tsx       # Status pie chart
│   │   │   └── CreateProjectModal.tsx
│   │   ├── layout/
│   │   │   ├── Layout.tsx           # App layout wrapper
│   │   │   └── Sidebar.tsx          # Navigation sidebar
│   │   └── project/
│   │       ├── ProjectDetail.tsx    # Project detail view
│   │       ├── ProjectHeader.tsx    # Project info header
│   │       ├── Timeline.tsx         # Phase timeline
│   │       ├── ChatSection.tsx      # Phase comments
│   │       ├── Notepad.tsx          # Notes component
│   │       ├── LinkSection.tsx      # Quick links
│   │       └── ContactSection.tsx   # Team contacts
│   ├── context/
│   │   ├── DataContext.tsx          # Project data state
│   │   └── ThemeContext.tsx         # Theme state
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces
│   ├── App.tsx                      # Main app component
│   └── main.tsx                     # Entry point
├── public/                          # Static assets
└── package.json
```

## Data Models

### Project
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  reportingManager: string;
  startDate: string;
  expectedEndDate: string;
  status: 'ongoing' | 'completed' | 'future' | 'on-hold';
  phases: Phase[];
  globalNotes: Note[];
  links: Link[];
  contacts: Contact[];
}
```

### Phase
```typescript
interface Phase {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'ongoing' | 'completed';
  description: string;
  comments: Comment[];
  notes: Note[];
}
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/SatvickMalhotra/full-stack-apps-with-AI.git
cd "MilestoneTracker(Central hub for projects bitbucket clone)"
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

4. Open browser at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Usage

### As a Manager
1. Login as Manager role
2. Create new projects from dashboard
3. Add phases to projects
4. Manage links and contacts
5. Track progress across all projects

### As a Team Member
1. View assigned projects
2. Add comments to phases
3. Add notes (phase-specific and global)
4. Track project timeline

## Customization

### Adding New Project Status
Update the `status` type in `src/types/index.ts`:
```typescript
status: 'ongoing' | 'completed' | 'future' | 'on-hold' | 'your-status';
```

### Changing Theme Colors
Edit CSS variables in your global styles or Tailwind config.

### Adding New Roles
Extend the `User` interface and update RBAC checks in components.

## Future Enhancements

- [ ] Backend integration (Firebase/Supabase)
- [ ] User authentication
- [ ] File attachments per phase
- [ ] Email notifications
- [ ] Gantt chart view
- [ ] Project templates
- [ ] Time tracking
- [ ] Export reports (PDF/Excel)

## License

Private - Internal Use Only

## Author

Built with AI assistance for M-SWASTH project management needs.
