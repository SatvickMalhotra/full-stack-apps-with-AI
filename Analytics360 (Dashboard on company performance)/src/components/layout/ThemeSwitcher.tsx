import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { themes, themeNames } from '../../themes';
import type { ThemeName } from '../../types';

export default function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentTheme, setTheme } = useThemeStore();

  const handleThemeChange = (theme: ThemeName) => {
    setTheme(theme);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all flex items-center gap-2"
      >
        <Palette className="w-5 h-5 text-[var(--color-text-secondary)]" />
        <span className="text-sm text-[var(--color-text-secondary)]">{themes[currentTheme].label}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-48 glass-card p-2 z-50"
            >
              {themeNames.map((themeName) => {
                const theme = themes[themeName];
                const isActive = currentTheme === themeName;

                return (
                  <motion.button
                    key={themeName}
                    whileHover={{ x: 4 }}
                    onClick={() => handleThemeChange(themeName)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white'
                        : 'hover:bg-[var(--color-surface)] text-[var(--color-text)]'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors.gradient1}, ${theme.colors.gradient2})`,
                      }}
                    />
                    <span className="flex-1 text-left text-sm">{theme.label}</span>
                    {isActive && <Check className="w-4 h-4" />}
                  </motion.button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
