import React, { useState } from 'react';
import { Send } from 'lucide-react';
import type { Comment } from '../../types';
import { format } from 'date-fns';

interface ChatSectionProps {
    comments: Comment[];

    onAddComment: (text: string) => void;
}

export const ChatSection: React.FC<ChatSectionProps> = ({ comments, onAddComment }) => {
    const [text, setText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        onAddComment(text);
        setText('');
    };

    return (
        <div className="flex flex-col h-[400px] card">
            <div className="p-4 border-b border-[var(--border)]">
                <h3 className="font-bold">Team Discussion</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments.length === 0 ? (
                    <div className="text-center text-[var(--text-muted)] mt-10">
                        No comments yet. Start the conversation!
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-[var(--bg-hover)] flex items-center justify-center text-xs font-bold shrink-0">
                                {comment.userName.charAt(0)}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">{comment.userName}</span>
                                    <span className="text-xs text-[var(--text-muted)]">
                                        {format(new Date(comment.timestamp), 'MMM d, h:mm a')}
                                    </span>
                                </div>
                                <div className="bg-[var(--bg-hover)] p-3 rounded-r-xl rounded-bl-xl text-sm">
                                    {comment.text}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--border)]">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={!text.trim()}
                        className="bg-[var(--primary)] text-white p-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
};
