import React, { useState } from 'react';
import { ProjectHeader } from './ProjectHeader';
import { Timeline } from './Timeline';
import { ChatSection } from './ChatSection';
import { Notepad } from './Notepad';
import { LinkSection } from './LinkSection';
import { ContactSection } from './ContactSection';
import { useData } from '../../context/DataContext';

interface ProjectDetailProps {
    projectId: string;
    onBack: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, onBack }) => {
    const { projects, currentUser, updateProject } = useData();
    const project = projects.find(p => p.id === projectId);
    const [activePhaseId, setActivePhaseId] = useState<string | null>(null);

    const isManager = currentUser.role === 'Manager';

    if (!project) return <div>Project not found</div>;

    React.useEffect(() => {
        if (!activePhaseId && project.phases.length > 0) {
            const ongoing = project.phases.find(p => p.status === 'ongoing');
            setActivePhaseId(ongoing ? ongoing.id : project.phases[0].id);
        }
    }, [project, activePhaseId]);

    const activePhase = project.phases.find(p => p.id === activePhaseId);

    const handleAddComment = (text: string) => {
        if (!activePhase) return;
        const newComment = {
            id: Date.now().toString(),
            userId: currentUser.id,
            userName: currentUser.name,
            text,
            timestamp: new Date().toISOString()
        };

        const updatedPhases = project.phases.map(p =>
            p.id === activePhaseId
                ? { ...p, comments: [...p.comments, newComment] }
                : p
        );

        updateProject(project.id, { phases: updatedPhases });
    };

    const handleAddPhaseNote = (content: string) => {
        if (!activePhase) return;
        const newNote = {
            id: Date.now().toString(),
            userId: currentUser.id,
            userName: currentUser.name,
            content,
            timestamp: new Date().toISOString()
        };

        const updatedPhases = project.phases.map(p =>
            p.id === activePhaseId
                ? { ...p, notes: [...p.notes, newNote] }
                : p
        );

        updateProject(project.id, { phases: updatedPhases });
    };

    const handleAddGlobalNote = (content: string) => {
        const newNote = {
            id: Date.now().toString(),
            userId: currentUser.id,
            userName: currentUser.name,
            content,
            timestamp: new Date().toISOString()
        };
        updateProject(project.id, { globalNotes: [...project.globalNotes, newNote] });
    };

    const handleAddLink = (title: string, url: string) => {
        if (!isManager) return; // RBAC Check
        const newLink = { id: Date.now().toString(), title, url };
        updateProject(project.id, { links: [...project.links, newLink] });
    };

    return (
        <div className="animate-in fade-in duration-500 pb-20">
            <ProjectHeader project={project} onBack={onBack} />

            <div className="mb-10">
                <div className="flex justify-between items-end mb-4">
                    <h2 className="text-xl font-bold">Project Timeline</h2>
                    {!isManager && (
                        <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-card)] px-2 py-1 rounded border border-[var(--border)]">
                            View Only
                        </span>
                    )}
                </div>
                <Timeline
                    phases={project.phases}
                    activePhaseId={activePhaseId}
                    onPhaseClick={setActivePhaseId}
                    projectId={project.id}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Left Column: Phase Details (7 cols) */}
                <div className="xl:col-span-7 space-y-8">
                    {activePhase && (
                        <div className="animate-in slide-in-from-left duration-300">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                                    {activePhase.name}
                                    <span className="text-sm font-normal text-[var(--text-muted)] border border-[var(--border)] px-2 py-0.5 rounded-full">
                                        Phase Details
                                    </span>
                                </h2>
                                <p className="text-[var(--text-secondary)] text-lg">{activePhase.description}</p>
                            </div>

                            <div className="space-y-8">
                                <ChatSection
                                    comments={activePhase.comments}
                                    onAddComment={handleAddComment}
                                />
                                <Notepad
                                    title={`Notes for ${activePhase.name}`}
                                    notes={activePhase.notes}
                                    onAddNote={handleAddPhaseNote}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Global Info (5 cols) */}
                <div className="xl:col-span-5 space-y-8">
                    <div className="sticky top-8 space-y-8">
                        <Notepad
                            title="Global Project Notes"
                            notes={project.globalNotes}
                            onAddNote={handleAddGlobalNote}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-6">
                            {/* Only Managers can add links */}
                            <div className={!isManager ? 'opacity-80 pointer-events-none' : ''}>
                                <LinkSection
                                    links={project.links}
                                    onAddLink={handleAddLink}
                                />
                            </div>

                            <ContactSection contacts={project.contacts} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
