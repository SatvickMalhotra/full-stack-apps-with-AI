import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { themes } from '../../themes';

interface KpiDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: { label: string; value: number }[];
}

export default function KpiDetailModal({ isOpen, onClose, title, data }: KpiDetailModalProps) {
  const { currentTheme } = useThemeStore();
  const theme = themes[currentTheme];
  const colors = theme.chart.colors;

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="modal-backdrop"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-[101] p-4"
          >
            <div className="glass-card w-full max-w-lg max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                <h3 className="text-lg font-semibold gradient-text">{title}</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-[var(--color-surface)]"
                >
                  <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                <div className="space-y-3">
                  {data.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--color-text)]">{item.label}</span>
                        <span
                          className="text-sm font-semibold px-3 py-1 rounded-full"
                          style={{
                            background: `${colors[index % colors.length]}20`,
                            color: colors[index % colors.length],
                          }}
                        >
                          {item.value.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="h-2 bg-[var(--color-surface)] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.value / maxValue) * 100}%` }}
                          transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                          className="h-full rounded-full"
                          style={{ background: colors[index % colors.length] }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
