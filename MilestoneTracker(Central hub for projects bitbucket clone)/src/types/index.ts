export interface Comment {
    id: string;
    userId: string;
    userName: string;
    text: string;
    timestamp: string; // ISO string
}

export interface Note {
    id: string;
    userId: string;
    userName: string;
    content: string;
    timestamp: string;
}

export interface Link {
    id: string;
    title: string;
    url: string;
}

export interface Contact {
    id: string;
    name: string;
    role: string;
    email: string;
    phone?: string;
}

export interface Phase {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: 'pending' | 'ongoing' | 'completed';
    description: string;
    comments: Comment[];
    notes: Note[];
}

export interface Project {
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

export interface User {
    id: string;
    name: string;
    role: string;
    avatar?: string;
}
