import { TrendingUp, TrendingDown, Wallet, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { clsx } from 'clsx';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, currency = 'USD', isLoading }) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400',
      gradient: 'from-blue-500 to-blue-600',
    },
    green: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      icon: 'text-emerald-600 dark:text-emerald-400',
      gradient: 'from-emerald-500 to-emerald-600',
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      icon: 'text-red-600 dark:text-red-400',
      gradient: 'from-red-500 to-red-600',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      icon: 'text-purple-600 dark:text-purple-400',
      gradient: 'from-purple-500 to-purple-600',
    },
  };

  const c = colorMap[color] || colorMap.blue;

  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="flex items-center gap-4">
          <div className="skeleton w-12 h-12 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-24 rounded" />
            <div className="skeleton h-7 w-32 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', c.bg)}>
            <Icon size={22} className={c.icon} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
              {formatCurrency(value || 0, currency)}
            </p>
          </div>
        </div>
        {trendValue !== undefined && (
          <div className={clsx(
            'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg',
            trend === 'up'
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
              : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
          )}>
            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendValue}%
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
