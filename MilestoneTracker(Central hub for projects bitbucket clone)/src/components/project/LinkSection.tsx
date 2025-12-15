import React, { useState } from 'react';
import { Link as LinkIcon, ExternalLink, Plus } from 'lucide-react';
import type { Link } from '../../types';

interface LinkSectionProps {
    links: Link[];
    onAddLink: (title: string, url: string) => void;
}

export const LinkSection: React.FC<LinkSectionProps> = ({ links, onAddLink }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title && url) {
            onAddLink(title, url);
            setTitle('');
            setUrl('');
            setIsAdding(false);
        }
    };

    return (
        <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold flex items-center gap-2">
                    <LinkIcon size={20} className="text-[var(--primary)]" />
                    Resources & Links
                </h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"
                >
                    <Plus size={16} /> Add Link
                </button>
            </div>

            <div className="space-y-3">
                {links.map((link) => (
                    <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-hover)] hover:bg-[var(--primary-glow)] transition-colors group"
                    >
                        <span className="font-medium">{link.title}</span>
                        <ExternalLink size={16} className="text-[var(--text-muted)] group-hover:text-[var(--primary)]" />
                    </a>
                ))}
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="mt-4 p-4 border border-[var(--border)] rounded-lg bg-[var(--bg-app)] animate-in fade-in">
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Link Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
                        />
                        <input
                            type="url"
                            placeholder="URL (https://...)"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-3 py-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-3 py-1 text-sm bg-[var(--primary)] text-white rounded hover:opacity-90"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
};
