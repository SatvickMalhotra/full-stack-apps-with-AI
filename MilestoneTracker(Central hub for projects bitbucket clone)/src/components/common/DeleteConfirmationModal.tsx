import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    projectName: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    projectName,
}) => {
    const [secretKey, setSecretKey] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (secretKey === 'satvickisbest') {
            onConfirm();
            onClose();
        } else {
            setError('Invalid secret key');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3 text-red-500">
                        <AlertTriangle size={24} />
                        <h3 className="text-xl font-bold">Delete Project</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                        <X size={20} />
                    </button>
                </div>

                <p className="text-[var(--text-secondary)] mb-6">
                    Are you sure you want to delete <span className="font-bold text-[var(--text-primary)]">{projectName}</span>?
                    This action cannot be undone.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                            Enter Secret Key to Confirm
                        </label>
                        <input
                            type="password"
                            value={secretKey}
                            onChange={(e) => {
                                setSecretKey(e.target.value);
                                setError('');
                            }}
                            placeholder="Enter secret key..."
                            className="w-full bg-[var(--bg-app)] border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-red-500"
                        />
                        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
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
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium shadow-lg shadow-red-500/20"
                        >
                            Delete Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
