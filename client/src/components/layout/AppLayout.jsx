import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Sun, Moon, Bell } from 'lucide-react';
import Sidebar from './Sidebar';
import useTheme from '../../hooks/useTheme';
import useSocket from '../../hooks/useSocket';
import { clsx } from 'clsx';

const AppLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  // Initialize socket connection
  useSocket();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-300">
      <Sidebar
        isOpen={isMobileOpen}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((v) => !v)}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* Main content */}
      <div className={clsx(
        'transition-all duration-300 min-h-screen',
        isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      )}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-6
          bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl border-b border-gray-100 dark:border-dark-600">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="lg:hidden btn-icon"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="hidden lg:block" />

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="btn-icon relative group"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
