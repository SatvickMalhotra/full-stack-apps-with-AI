import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { StatsChart } from './StatsChart';
import { useData } from '../../context/DataContext';
import { CreateProjectModal } from './CreateProjectModal';

interface DashboardProps {
    onProjectClick: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onProjectClick }) => {
    const { projects, currentUser } = useData();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const isManager = currentUser.role === 'Manager';

    return (
        <div className="animate-in fade-in duration-500 pb-20">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    Welcome back, {currentUser.name} 👋
                </h1>
                <p className="text-[var(--text-secondary)]">
                    Here's what's happening with your projects today.
                </p>
            </div>

            {isManager && (
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mb-8 flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium shadow-lg shadow-[var(--primary-glow)]"
                >
                    <Plus size={20} />
                    New Project
                </button>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                Ongoing
                                <span className="text-xs font-normal text-[var(--text-muted)] border border-[var(--border)] px-2 py-0.5 rounded-full">
                                    {projects.filter(p => p.status === 'ongoing').length}
                                </span>
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {projects.filter(p => p.status === 'ongoing').map(project => (
                                <ProjectCard key={project.id} project={project} onClick={onProjectClick} />
                            ))}
                            {projects.filter(p => p.status === 'ongoing').length === 0 && (
                                <div className="text-center py-8 border border-dashed border-[var(--border)] rounded-xl text-[var(--text-muted)]">
                                    No ongoing projects.
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                Future
                                <span className="text-xs font-normal text-[var(--text-muted)] border border-[var(--border)] px-2 py-0.5 rounded-full">
                                    {projects.filter(p => p.status === 'future').length}
                                </span>
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {projects.filter(p => p.status === 'future').map(project => (
                                <ProjectCard key={project.id} project={project} onClick={onProjectClick} />
                            ))}
                            {projects.filter(p => p.status === 'future').length === 0 && (
                                <div className="text-center py-8 border border-dashed border-[var(--border)] rounded-xl text-[var(--text-muted)]">
                                    No future projects planned.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div>
                        <h2 className="text-xl font-bold mb-4">Project Status</h2>
                        <div className="card p-4 h-[300px]">
                            <StatsChart projects={projects} />
                        </div>
                    </div>
                </div>
            </div>

            <CreateProjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
};
