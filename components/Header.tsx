import React from 'react';
import { SettingsIcon, BoltIcon, SunIcon, MoonIcon } from './IconComponents';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  onOpenSettings: () => void;
  onNavigateHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings, onNavigateHome }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-[var(--header-bg)] backdrop-blur-lg sticky top-0 z-20 border-b border-[var(--border-color)]">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={onNavigateHome} className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] rounded-lg">
            <div className="p-2 bg-indigo-600/20 rounded-lg">
                <BoltIcon className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Astra Boltz
            </span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)]"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)]"
              aria-label="Open settings"
            >
              <SettingsIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;