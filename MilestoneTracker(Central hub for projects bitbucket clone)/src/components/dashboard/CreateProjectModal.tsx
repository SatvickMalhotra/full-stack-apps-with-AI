import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useData } from '../../context/DataContext';
import type { Project } from '../../types';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose }) => {
    const { addProject, currentUser } = useData();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startDate: '',
        expectedEndDate: '',
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newProject: Project = {
            id: Date.now().toString(),
            name: formData.name,
            description: formData.description,
            reportingManager: currentUser.name, // Auto-assign current manager
            startDate: formData.startDate,
            expectedEndDate: formData.expectedEndDate,
            status: 'ongoing',
            phases: [], // Initialize with empty phases or default phases
            globalNotes: [],
            links: [],
            contacts: [
                {
                    id: Date.now().toString(),
                    name: currentUser.name,
                    role: 'Manager',
                    email: 'manager@example.com'
                }
            ]
        };

        addProject(newProject);
        onClose();
        // Reset form
        setFormData({
            name: '',
            description: '',
            startDate: '',
            expectedEndDate: '',
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Create New Project</h3>
                    <button
                        onClick={onClose}
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Project Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-[var(--bg-app)] border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--primary)]"
                            placeholder="e.g., Q1 Roadmap"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Description</label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-[var(--bg-app)] border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--primary)] h-24 resize-none"
                            placeholder="Brief description of the project..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Start Date</label>
                            <input
                                type="date"
                                required
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full bg-[var(--bg-app)] border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--primary)]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Expected End Date</label>
                            <input
                                type="date"
                                required
                                value={formData.expectedEndDate}
                                onChange={(e) => setFormData({ ...formData, expectedEndDate: e.target.value })}
                                className="w-full bg-[var(--bg-app)] border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--primary)]"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center gap-2 shadow-lg shadow-[var(--primary-glow)]"
                        >
                            <Plus size={18} />
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
