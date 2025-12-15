import React, { useState } from 'react';
import { Save, FileText } from 'lucide-react';
import type { Note } from '../../types';
import { format } from 'date-fns';

interface NotepadProps {
    notes: Note[];
    onAddNote: (content: string) => void;
    title?: string;
}

export const Notepad: React.FC<NotepadProps> = ({ notes, onAddNote, title = "Project Notes" }) => {
    const [content, setContent] = useState('');

    const handleSave = () => {
        if (!content.trim()) return;
        onAddNote(content);
        setContent('');
    };

    return (
        <div className="card h-[600px] flex flex-col">
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-hover)] rounded-t-xl">
                <div className="flex items-center gap-2">
                    <FileText size={20} className="text-[var(--primary)]" />
                    <h3 className="font-bold text-lg">{title}</h3>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!content.trim()}
                    className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 font-medium transition-all shadow-lg shadow-[var(--primary-glow)]"
                >
                    <Save size={16} />
                    Save Note
                </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Note List */}
                <div className="w-full md:w-1/3 border-r border-[var(--border)] overflow-y-auto p-4 space-y-3 bg-[var(--bg-app)]">
                    <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">History</h4>
                    {notes.length === 0 ? (
                        <div className="text-center text-[var(--text-muted)] text-sm py-8">
                            No notes yet.
                        </div>
                    ) : (
                        notes.map((note) => (
                            <div key={note.id} className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--primary)] transition-colors group cursor-default">
                                <p className="line-clamp-3 mb-3 text-sm leading-relaxed">{note.content}</p>
                                <div className="flex justify-between items-center text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
                                    <span className="font-medium text-[var(--text-primary)]">{note.userName}</span>
                                    <span>{format(new Date(note.timestamp), 'MMM d, h:mm a')}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Editor */}
                <div className="flex-1 p-6 bg-[var(--bg-card)]">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Type your notes here... (Markdown supported)"
                        className="w-full h-full bg-transparent resize-none focus:outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)] text-lg leading-relaxed"
                    />
                </div>
            </div>
        </div>
    );
};
