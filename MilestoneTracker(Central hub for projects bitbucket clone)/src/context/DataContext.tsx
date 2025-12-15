import React, { createContext, useContext, useState } from 'react';
import type { Project, User } from '../types';

interface DataContextType {
    projects: Project[];
    currentUser: User;
    users: User[];
    setCurrentUser: (user: User) => void;
    addProject: (project: Project) => void;
    updateProject: (id: string, updates: Partial<Project>) => void;
    deleteProject: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const MOCK_USERS: User[] = [
    { id: 'u1', name: 'Prakash Ranjan', role: 'Manager', avatar: 'PR' },
    { id: 'u2', name: 'Demo User 1', role: 'User', avatar: 'D1' },
    { id: 'u3', name: 'Demo User 2', role: 'User', avatar: 'D2' },
];

const MOCK_PROJECTS: Project[] = [
    {
        id: 'p1',
        name: 'Designing a Map',
        description: 'Design and implement a map interface for the Operations and Sales team to track logistics.',
        reportingManager: 'Prakash Ranjan',
        startDate: '2025-11-20',
        expectedEndDate: '2025-12-10',
        status: 'ongoing',
        phases: [
            {
                id: 'ph1',
                name: 'Planning',
                startDate: '2025-11-20',
                endDate: '2025-11-22',
                status: 'completed',
                description: 'Initial requirement gathering and scope definition.',
                comments: [],
                notes: []
            },
            {
                id: 'ph2',
                name: 'Design Simple Web App',
                startDate: '2025-11-23',
                endDate: '2025-11-27',
                status: 'completed',
                description: 'Wireframing and basic UI implementation.',
                comments: [],
                notes: []
            },
            {
                id: 'ph3',
                name: 'Version 2 Features',
                startDate: '2025-11-28',
                endDate: '2025-12-05',
                status: 'ongoing',
                description: 'Adding advanced features and interactivity.',
                comments: [],
                notes: []
            },
            {
                id: 'ph4',
                name: 'Testing',
                startDate: '2025-12-03',
                endDate: '2025-12-10',
                status: 'pending',
                description: 'QA and user acceptance testing.',
                comments: [],
                notes: []
            },
            {
                id: 'ph5',
                name: 'Launch',
                startDate: '2025-12-10',
                endDate: '2025-12-10',
                status: 'pending',
                description: 'Official release to production.',
                comments: [],
                notes: []
            }
        ],
        globalNotes: [
            {
                id: 'gn1',
                userId: 'u1',
                userName: 'Prakash Ranjan',
                content: 'Please ensure the map supports offline mode.',
                timestamp: '2025-11-21T10:00:00Z'
            }
        ],
        links: [
            { id: 'l1', title: 'Figma Design', url: 'https://figma.com/design-map' },
            { id: 'l2', title: 'PRD', url: 'https://docs.google.com/prd' }
        ],
        contacts: [
            { id: 'c1', name: 'Prakash Ranjan', role: 'Manager', email: 'prakash@example.com' }
        ]
    },
    {
        id: 'p2',
        name: 'Q4 Marketing Campaign',
        description: 'End-of-year marketing push for new product lines.',
        reportingManager: 'Sarah Jenkins',
        startDate: '2025-12-01',
        expectedEndDate: '2025-12-31',
        status: 'future',
        phases: [
            {
                id: 'ph2-1',
                name: 'Content Strategy',
                startDate: '2025-12-01',
                endDate: '2025-12-05',
                status: 'pending',
                description: 'Drafting blog posts and social media copy.',
                comments: [],
                notes: []
            },
            {
                id: 'ph2-2',
                name: 'Asset Creation',
                startDate: '2025-12-06',
                endDate: '2025-12-15',
                status: 'pending',
                description: 'Designing banners and video ads.',
                comments: [],
                notes: []
            }
        ],
        globalNotes: [],
        links: [],
        contacts: [
            { id: 'c2', name: 'Sarah Jenkins', role: 'Marketing Lead', email: 'sarah@example.com' }
        ]
    }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
    const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);

    const addProject = (project: Project) => {
        setProjects((prev) => [...prev, project]);
    };

    const updateProject = (id: string, updates: Partial<Project>) => {
        setProjects((prev) =>
            prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
        );
    };

    const deleteProject = (id: string) => {
        setProjects((prev) => prev.filter((p) => p.id !== id));
    };

    return (
        <DataContext.Provider value={{ projects, currentUser, users: MOCK_USERS, setCurrentUser, addProject, updateProject, deleteProject }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
