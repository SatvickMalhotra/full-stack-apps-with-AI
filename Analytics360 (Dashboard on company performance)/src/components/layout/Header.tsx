import { motion } from 'framer-motion';
import { Activity, Database, RefreshCw } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';
import { useDataStore } from '../../stores/dataStore';

interface HeaderProps {
  activeTab: 'dashboard' | 'master';
  onTabChange: (tab: 'dashboard' | 'master') => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const { fetchData, isLoading } = useDataStore();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-card px-6 py-4 mb-6 flex items-center justify-between relative z-50"
    >
      <div className="flex items-center gap-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gradient-1)] to-[var(--gradient-2)] flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">M-SWASTH</h1>
            <p className="text-xs text-[var(--color-text-secondary)]">Statistics Dashboard</p>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 ml-8 bg-[var(--color-surface)] rounded-lg p-1">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Dashboard
            </span>
          </button>
          <button
            onClick={() => onTabChange('master')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'master'
                ? 'bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Master Portal
            </span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fetchData()}
          disabled={isLoading}
          className="p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all"
          title="Refresh Data"
        >
          <RefreshCw className={`w-5 h-5 text-[var(--color-text-secondary)] ${isLoading ? 'animate-spin' : ''}`} />
        </motion.button>
        <ThemeSwitcher />
      </div>
    </motion.header>
  );
}
