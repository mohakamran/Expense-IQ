import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, PieChart, Wallet,
  Tag, User, LogOut, TrendingUp, Menu, X, ChevronLeft,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { clsx } from 'clsx';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/analytics', icon: PieChart, label: 'Analytics' },
  { to: '/budget', icon: Wallet, label: 'Budget' },
  { to: '/categories', icon: Tag, label: 'Categories' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const Sidebar = ({ isOpen, isCollapsed, onToggleCollapse, onMobileClose }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed left-0 top-0 h-full z-50 flex flex-col',
          'bg-white dark:bg-dark-800 border-r border-gray-100 dark:border-dark-600',
          'transition-all duration-300 ease-in-out shadow-xl lg:shadow-none',
          isCollapsed ? 'w-20' : 'w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className={clsx('flex items-center p-4 h-16 border-b border-gray-100 dark:border-dark-600',
          isCollapsed ? 'justify-center' : 'justify-between')}>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30">
                <TrendingUp size={16} className="text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white text-lg">ExpenseIQ</span>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30">
              <TrendingUp size={16} className="text-white" />
            </div>
          )}
          {/* Desktop collapse btn */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex btn-icon text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft size={16} className={clsx('transition-transform duration-300', isCollapsed && 'rotate-180')} />
          </button>
          {/* Mobile close btn */}
          <button onClick={onMobileClose} className="lg:hidden btn-icon" aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onMobileClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-all duration-200 group',
                  isActive
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-600 hover:text-gray-900 dark:hover:text-gray-100',
                  isCollapsed && 'justify-center px-2'
                )
              }
              title={isCollapsed ? label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!isCollapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-gray-100 dark:border-dark-600">
          {!isCollapsed && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={clsx(
              'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium',
              'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200',
              isCollapsed && 'justify-center'
            )}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut size={16} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
