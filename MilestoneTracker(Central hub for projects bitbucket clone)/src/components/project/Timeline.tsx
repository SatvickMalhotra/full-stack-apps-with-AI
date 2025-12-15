import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, Edit2, X } from 'lucide-react';
import type { Phase } from '../../types';
import { format } from 'date-fns';
import clsx from 'clsx';
import { useData } from '../../context/DataContext';

interface TimelineProps {
    phases: Phase[];
    activePhaseId: string | null;
    onPhaseClick: (id: string) => void;
    projectId: string; // Needed for updates
}

export const Timeline: React.FC<TimelineProps> = ({ phases, activePhaseId, onPhaseClick, projectId }) => {
    const { currentUser, updateProject } = useData();
    const isManager = currentUser.role === 'Manager';
    const [editingPhase, setEditingPhase] = useState<Phase | null>(null);

    const handleSavePhase = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPhase) return;

        const updatedPhases = phases.map(p => p.id === editingPhase.id ? editingPhase : p);
        updateProject(projectId, { phases: updatedPhases });
        setEditingPhase(null);
    };

    return (
        <>
            <div className="relative overflow-x-auto pb-8 pt-4 hide-scrollbar">
                {/* Connecting Line */}
                <div className="absolute top-[3.5rem] left-0 w-full h-0.5 bg-[var(--border)] -z-10" />

                <div className="flex gap-8 min-w-max px-4">
                    {phases.map((phase) => {
                        const isActive = activePhaseId === phase.id;
                        const isCompleted = phase.status === 'completed';
                        const isOngoing = phase.status === 'ongoing';

                        return (
                            <div
                                key={phase.id}
                                className={clsx(
                                    "relative flex flex-col items-center gap-4 group cursor-pointer transition-all duration-300",
                                    isActive ? "scale-105" : "opacity-70 hover:opacity-100"
                                )}
                                onClick={() => onPhaseClick(phase.id)}
                            >
                                <div className={clsx(
                                    "w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors duration-300 shadow-lg relative",
                                    isCompleted
                                        ? "bg-[var(--status-completed)] border-[var(--status-completed)] text-white"
                                        : isOngoing
                                            ? "bg-[var(--bg-card)] border-[var(--status-ongoing)] text-[var(--status-ongoing)]"
                                            : "bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-muted)]"
                                )}>
                                    {isCompleted ? <CheckCircle2 size={20} /> : isOngoing ? <Clock size={20} /> : <Circle size={20} />}

                                    {isManager && isActive && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingPhase(phase);
                                            }}
                                            className="absolute -top-2 -right-2 bg-[var(--bg-card)] border border-[var(--border)] p-1.5 rounded-full text-[var(--text-secondary)] hover:text-[var(--primary)] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Edit2 size={12} />
                                        </button>
                                    )}
                                </div>

                                <div className="text-center w-40">
                                    <h3 className={clsx(
                                        "font-bold text-sm mb-1 transition-colors",
                                        isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                                    )}>
                                        {phase.name}
                                    </h3>
                                    <p className="text-xs text-[var(--text-muted)]">
                                        {format(new Date(phase.startDate), 'MMM d')} - {format(new Date(phase.endDate), 'MMM d')}
                                    </p>
                                    <span className={clsx(
                                        "inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                                        isCompleted ? "bg-green-500/10 text-green-500" :
                                            isOngoing ? "bg-blue-500/10 text-blue-500" :
                                                "bg-gray-500/10 text-gray-500"
                                    )}>
                                        {phase.status}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Edit Phase Modal */}
            {editingPhase && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Edit Phase</h3>
                            <button
                                onClick={() => setEditingPhase(null)}
                                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSavePhase} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Phase Name</label>
                                <input
                                    type="text"
                                    value={editingPhase.name}
                                    onChange={(e) => setEditingPhase({ ...editingPhase, name: e.target.value })}
                                    className="w-full bg-[var(--bg-app)] border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--primary)]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={editingPhase.startDate}
                                        onChange={(e) => setEditingPhase({ ...editingPhase, startDate: e.target.value })}
                                        className="w-full bg-[var(--bg-app)] border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--primary)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={editingPhase.endDate}
                                        onChange={(e) => setEditingPhase({ ...editingPhase, endDate: e.target.value })}
                                        className="w-full bg-[var(--bg-app)] border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--primary)]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Status</label>
                                <select
                                    value={editingPhase.status}
                                    onChange={(e) => setEditingPhase({ ...editingPhase, status: e.target.value as any })}
                                    className="w-full bg-[var(--bg-app)] border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--primary)]"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setEditingPhase(null)}
                                    className="px-4 py-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};
