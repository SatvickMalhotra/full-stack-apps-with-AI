import React, { useState } from 'react';
import { Calendar, ArrowLeft, MoreHorizontal, ChevronDown, Trash2 } from 'lucide-react';
import type { Project } from '../../types';
import { format } from 'date-fns';
import { useData } from '../../context/DataContext';
import clsx from 'clsx';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';

interface ProjectHeaderProps {
    project: Project;
    onBack: () => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project, onBack }) => {
    const { currentUser, updateProject, deleteProject } = useData();
    const isManager = currentUser.role === 'Manager';
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const statusColors = {
        ongoing: 'bg-[var(--status-ongoing)]',
        completed: 'bg-[var(--status-completed)]',
        future: 'bg-[var(--status-future)]',
        'on-hold': 'bg-[var(--status-on-hold)]'
    };

    const statusLabels = {
        ongoing: 'Ongoing',
        completed: 'Completed',
        future: 'Future',
        'on-hold': 'On Hold'
    };

    const handleStatusChange = (newStatus: Project['status']) => {
        updateProject(project.id, { status: newStatus });
    };

    const handleDelete = () => {
        deleteProject(project.id);
        onBack(); // Return to dashboard after deletion
    };

    return (
        <div className="mb-8">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6 group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </button>

            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent">
                            {project.name}
                        </h1>
                        {isManager ? (
                            <div className="relative group">
                                <button className={clsx(
                                    "px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1",
                                    statusColors[project.status]
                                )}>
                                    {statusLabels[project.status]}
                                    <ChevronDown size={14} />
                                </button>

                                <div className="absolute top-full left-0 mt-2 w-32 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-xl overflow-hidden hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-200">
                                    {(Object.keys(statusLabels) as Array<keyof typeof statusLabels>).map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusChange(status)}
                                            className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-hover)] transition-colors flex items-center gap-2"
                                        >
                                            <div className={clsx("w-2 h-2 rounded-full", statusColors[status])} />
                                            {statusLabels[status]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <span className={clsx(
                                "px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider",
                                statusColors[project.status]
                            )}>
                                {statusLabels[project.status]}
                            </span>
                        )}
                    </div>
                    <p className="text-xl text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                        {project.description}
                    </p>
                </div>

                <div className="flex gap-3">
                    {isManager && (
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                            title="Delete Project"
                        >
                            <Trash2 size={24} />
                        </button>
                    )}
                    <button className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors">
                        <MoreHorizontal size={24} />
                    </button>
                </div>
            </div>

            <div className="flex gap-8 mt-8 pb-8 border-b border-[var(--border)]">
                <div>
                    <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">Reporting Manager</p>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-xs font-bold">
                            {project.reportingManager.charAt(0)}
                        </div>
                        <p className="font-medium">{project.reportingManager}</p>
                    </div>
                </div>
                <div>
                    <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">Timeline</p>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <Calendar size={16} />
                        <p className="font-medium">
                            {format(new Date(project.startDate), 'MMM d, yyyy')} - {format(new Date(project.expectedEndDate), 'MMM d, yyyy')}
                        </p>
                    </div>
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                projectName={project.name}
            />
        </div>
    );
};
