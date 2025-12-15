import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  delay?: number;
  onClick?: () => void;
  format?: 'number' | 'compact';
}

function formatNumber(num: number, format: 'number' | 'compact' = 'number'): string {
  if (format === 'compact') {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
  }
  return num.toLocaleString('en-IN');
}

export default function KpiCard({ title, value, icon: Icon, color, delay = 0, onClick, format = 'number' }: KpiCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const stepValue = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -4 }}
      onClick={onClick}
      className={`glass-card p-6 glow-hover ${onClick ? 'cursor-pointer' : ''}`}
      style={{ '--glow-rgb': color.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', ') } as React.CSSProperties}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${color}40, ${color}20)` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay * 0.1 + 0.3, type: 'spring' }}
          className="w-2 h-2 rounded-full"
          style={{ background: color }}
        />
      </div>

      <div>
        <p className="text-[var(--color-text-secondary)] text-sm mb-1">{title}</p>
        <motion.p
          className="text-3xl font-bold"
          style={{ color }}
        >
          {formatNumber(displayValue, format)}
        </motion.p>
      </div>
    </motion.div>
  );
}
