import React from 'react';
import { LayoutDashboard, FolderKanban, Settings, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import clsx from 'clsx';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
    const { theme, toggleTheme } = useTheme();
    const { currentUser, users, setCurrentUser } = useData();

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'projects', label: 'Projects', icon: FolderKanban },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="h-screen w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border)] flex flex-col transition-colors duration-300">
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
                    ProjectTracker
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={clsx(
                                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                                isActive
                                    ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary-glow)]'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                            )}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-[var(--border)] space-y-2">
                {/* User Switcher */}
                <div className="mb-4">
                    <p className="text-xs font-semibold text-[var(--text-muted)] mb-2 px-2 uppercase tracking-wider">
                        Switch User (Demo)
                    </p>
                    <div className="space-y-1">
                        {users.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => setCurrentUser(user)}
                                className={clsx(
                                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all',
                                    currentUser.id === user.id
                                        ? 'bg-[var(--bg-hover)] text-[var(--primary)] font-medium border border-[var(--primary)]'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                                )}
                            >
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-xs">
                                    {user.avatar || user.name.charAt(0)}
                                </div>
                                <span className="truncate">{user.name}</span>
                                {user.role === 'Manager' && <span className="ml-auto text-[10px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded">M</span>}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    <span className="font-medium">
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </span>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all">
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};
