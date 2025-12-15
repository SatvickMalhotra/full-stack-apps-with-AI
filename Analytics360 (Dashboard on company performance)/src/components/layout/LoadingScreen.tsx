import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../../stores/themeStore';

export default function LoadingScreen() {
  const { isLoading } = useThemeStore();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="loading-overlay"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="loading-logo gradient-text"
          >
            M-SWASTH
          </motion.div>

          <div className="loading-bar-container">
            <motion.div
              className="loading-bar"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-[var(--color-text-secondary)] text-sm"
          >
            Loading dashboard...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
