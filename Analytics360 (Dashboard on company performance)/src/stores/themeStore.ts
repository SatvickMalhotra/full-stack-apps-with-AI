import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeName } from '../types';
import { themes } from '../themes';

interface ThemeStore {
  currentTheme: ThemeName;
  isLoading: boolean;
  setTheme: (theme: ThemeName) => void;
  setLoading: (loading: boolean) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      currentTheme: 'normal',
      isLoading: true,
      setTheme: (theme) => {
        set({ isLoading: true });
        // Apply theme CSS variables
        const themeConfig = themes[theme];
        const root = document.documentElement;

        root.style.setProperty('--color-primary', themeConfig.colors.primary);
        root.style.setProperty('--color-secondary', themeConfig.colors.secondary);
        root.style.setProperty('--color-accent', themeConfig.colors.accent);
        root.style.setProperty('--color-background', themeConfig.colors.background);
        root.style.setProperty('--color-surface', themeConfig.colors.surface);
        root.style.setProperty('--color-text', themeConfig.colors.text);
        root.style.setProperty('--color-text-secondary', themeConfig.colors.textSecondary);
        root.style.setProperty('--color-border', themeConfig.colors.border);
        root.style.setProperty('--gradient-1', themeConfig.colors.gradient1);
        root.style.setProperty('--gradient-2', themeConfig.colors.gradient2);
        root.style.setProperty('--glow-rgb', themeConfig.colors.glowRgb);

        setTimeout(() => {
          set({ currentTheme: theme, isLoading: false });
        }, 800);
      },
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'mswasth-theme',
    }
  )
);
