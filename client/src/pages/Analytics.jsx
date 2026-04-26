import { useEffect, useState } from 'react';
import useTransactionStore from '../store/transactionStore';
import useAuthStore from '../store/authStore';
import { MonthlyAreaChart, IncomeExpenseBarChart, CategoryPieChart } from '../components/charts/Charts';
import { formatCurrency } from '../utils/helpers';
import { clsx } from 'clsx';
import useDocumentTitle from '../hooks/useDocumentTitle';

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

const Analytics = () => {
  useDocumentTitle('Analytics');
  const { analytics, isLoading, fetchAnalytics } = useTransactionStore();
  const { user } = useAuthStore();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics({ year, month });
  }, [year, month]);

  const { income = 0, expenses = 0, balance = 0 } = analytics?.totals || {};
  const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'trends', label: 'Trends' },
    { id: 'categories', label: 'Categories' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Financial insights & trends</p>
        </div>
        <div className="flex gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="input w-auto min-w-[110px]"
            aria-label="Select month"
          >
            <option value="all">All Months</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="input w-auto min-w-[100px]"
            aria-label="Select year"
          >
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Income', value: income, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', emoji: '📈' },
          { label: 'Total Expenses', value: expenses, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', emoji: '📉' },
          { label: 'Net Balance', value: balance, color: balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400', bg: 'bg-blue-50 dark:bg-blue-900/20', emoji: '💰' },
          { label: 'Savings Rate', value: `${savingsRate}%`, isPercent: true, color: savingsRate >= 20 ? 'text-emerald-600 dark:text-emerald-400' : 'text-yellow-600 dark:text-yellow-400', bg: 'bg-purple-50 dark:bg-purple-900/20', emoji: '🎯' },
        ].map(({ label, value, color, bg, emoji, isPercent }) => (
          <div key={label} className="card">
            {isLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="skeleton h-3 w-20 rounded" />
                <div className="skeleton h-7 w-24 rounded" />
              </div>
            ) : (
              <>
                <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3', bg)}>
                  {emoji}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
                <p className={clsx('text-xl font-bold mt-0.5', color)}>
                  {isPercent ? value : formatCurrency(value, user?.currency)}
                </p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-dark-700 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              activeTab === tab.id
                ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Monthly Overview</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Income vs expenses trend</p>
            <MonthlyAreaChart data={analytics?.monthly} isLoading={isLoading} currency={user?.currency} />
          </div>
          <div className="card">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Spending by Category</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Where your money goes</p>
            <CategoryPieChart data={analytics?.byCategory} isLoading={isLoading} currency={user?.currency} />
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Income vs Expenses — Bar Chart</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Monthly comparison for {year}</p>
          <IncomeExpenseBarChart data={analytics?.monthly} isLoading={isLoading} currency={user?.currency} />
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Expense Breakdown by Category</h2>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}
            </div>
          ) : !analytics?.byCategory?.length ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-10">No expense data for {year}</p>
          ) : (
            <div className="space-y-3">
              {analytics.byCategory.map((item, i) => {
                const pct = expenses > 0 ? Math.round((item.total / expenses) * 100) : 0;
                return (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-28 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{item._id}</div>
                    <div className="flex-1 bg-gray-100 dark:bg-dark-500 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#f97316','#ec4899'][i % 8],
                        }}
                      />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">{pct}%</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white w-24 text-right">
                      {formatCurrency(item.total, user?.currency)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;
