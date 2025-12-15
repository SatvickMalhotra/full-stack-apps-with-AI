import React from 'react';
import { Users, Mail, Phone } from 'lucide-react';
import type { Contact } from '../../types';

interface ContactSectionProps {
    contacts: Contact[];
}

export const ContactSection: React.FC<ContactSectionProps> = ({ contacts }) => {
    return (
        <div className="card p-6">
            <h3 className="font-bold flex items-center gap-2 mb-4">
                <Users size={20} className="text-[var(--primary)]" />
                Key Contacts
            </h3>

            <div className="space-y-4">
                {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg-hover)]">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] flex items-center justify-center text-white font-bold shrink-0">
                            {contact.name.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold">{contact.name}</p>
                            <p className="text-xs text-[var(--text-secondary)] mb-2">{contact.role}</p>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                                    <Mail size={14} />
                                    <a href={`mailto:${contact.email}`} className="hover:text-[var(--primary)] transition-colors">
                                        {contact.email}
                                    </a>
                                </div>
                                {contact.phone && (
                                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                                        <Phone size={14} />
                                        <span>{contact.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
