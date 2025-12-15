import React from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import type { Project } from '../../types';
import clsx from 'clsx';
import { format } from 'date-fns';

interface ProjectCardProps {
    project: Project;
    onClick: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
    const statusColors = {
        ongoing: 'text-[var(--status-ongoing)] bg-blue-500/10 border-blue-500/20',
        completed: 'text-[var(--status-completed)] bg-emerald-500/10 border-emerald-500/20',
        future: 'text-[var(--status-future)] bg-amber-500/10 border-amber-500/20',
        'on-hold': 'text-[var(--status-on-hold)] bg-red-500/10 border-red-500/20',
    };

    const progress = Math.round(
        (project.phases.filter(p => p.status === 'completed').length / project.phases.length) * 100
    ) || 0;

    return (
        <div
            onClick={() => onClick(project.id)}
            className="card p-6 cursor-pointer group hover:border-[var(--primary)] transition-all duration-300"
        >
            <div className="flex justify-between items-start mb-4">
                <span className={clsx(
                    'px-3 py-1 rounded-full text-xs font-medium border',
                    statusColors[project.status]
                )}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
                <ArrowRight className="text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" size={20} />
            </div>

            <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--primary)] transition-colors">
                {project.name}
            </h3>

            <p className="text-[var(--text-secondary)] text-sm mb-6 line-clamp-2">
                {project.description}
            </p>

            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <User size={16} />
                    <span>{project.reportingManager}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Calendar size={16} />
                    <span>{format(new Date(project.expectedEndDate), 'MMM d, yyyy')}</span>
                </div>
            </div>

            <div className="mt-6">
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-[var(--text-secondary)]">Progress</span>
                    <span className="font-medium">{progress}%</span>
                </div>
                <div className="h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[var(--primary)] transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};
