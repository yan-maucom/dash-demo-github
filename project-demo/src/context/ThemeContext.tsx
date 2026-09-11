import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppTheme } from '../types';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>('green_light');

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
  };

  useEffect(() => {
    const root = document.documentElement;
    // Always enforce the soft green hospital theme
    root.classList.remove('theme-light', 'theme-dark', 'dark');
    root.classList.add('theme-green-light');
    localStorage.setItem('caf_app_theme', 'green_light');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

