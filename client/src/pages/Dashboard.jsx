import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, Plus } from 'lucide-react';
import useTransactionStore from '../store/transactionStore';
import useAuthStore from '../store/authStore';
import useCategoryStore from '../store/categoryStore';
import useBudgetStore from '../store/budgetStore';
import StatCard from '../components/dashboard/StatCard';
import TransactionItem from '../components/transactions/TransactionItem';
import { MonthlyAreaChart } from '../components/charts/Charts';
import Modal from '../components/ui/Modal';
import TransactionForm from '../components/transactions/TransactionForm';
import { formatCurrency } from '../utils/helpers';
import { clsx } from 'clsx';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Dashboard = () => {
  useDocumentTitle('Dashboard');
  const { user } = useAuthStore();
  const { transactions, analytics, isLoading, fetchTransactions, fetchAnalytics } = useTransactionStore();
  const { fetchCategories } = useCategoryStore();
  const { budgetInfo, fetchBudget } = useBudgetStore();
  const [showAdd, setShowAdd] = useState(false);

  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState('all');

  useEffect(() => {
    fetchTransactions({ limit: 10 });
    fetchCategories();
    fetchBudget();
  }, []);

  useEffect(() => {
    fetchAnalytics({ year, month });
  }, [year, month]);

  const { income = 0, expenses = 0, balance = 0 } = analytics?.totals || {};
  const budgetPercent = budgetInfo?.percentUsed || 0;
  const isOverBudget = budgetInfo?.isOverBudget;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Good {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Here's your financial overview
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="input w-auto min-w-[110px] hidden sm:block"
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
            className="input w-auto min-w-[100px] hidden sm:block"
            aria-label="Select year"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button onClick={() => setShowAdd(true)} className="btn-primary gap-2" id="add-transaction-btn">
            <Plus size={16} />
            <span className="hidden sm:inline">Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Balance" value={balance} icon={Wallet} color="blue" currency={user?.currency} isLoading={isLoading} />
        <StatCard title="Total Income" value={income} icon={TrendingUp} color="green" currency={user?.currency} isLoading={isLoading} />
        <StatCard title="Total Expenses" value={expenses} icon={TrendingDown} color="red" currency={user?.currency} isLoading={isLoading} />

        {/* Budget card */}
        <div className="card hover:shadow-md transition-all duration-300">
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="skeleton h-3 w-20 rounded" />
              <div className="skeleton h-6 w-28 rounded" />
              <div className="skeleton h-2 w-full rounded-full" />
            </div>
          ) : budgetInfo?.budget ? (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Monthly Budget</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                {formatCurrency(budgetInfo.totalSpent, user?.currency)} <span className="text-sm font-normal text-gray-400">/ {formatCurrency(budgetInfo.budget.monthlyLimit, user?.currency)}</span>
              </p>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>{budgetPercent}% used</span>
                  <span className={isOverBudget ? 'text-red-500 font-semibold' : ''}>{isOverBudget ? '⚠️ Over budget!' : 'On track'}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-dark-500 rounded-full h-2">
                  <div
                    className={clsx('h-2 rounded-full transition-all duration-700', isOverBudget ? 'bg-red-500' : budgetPercent > 80 ? 'bg-yellow-500' : 'bg-emerald-500')}
                    style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-sm text-gray-400 dark:text-gray-500 py-2">
              <Wallet size={24} className="mx-auto mb-2 opacity-40" />
              No budget set
            </div>
          )}
        </div>
      </div>

      {/* Charts + Transactions */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Area chart */}
        <div className="xl:col-span-3 card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Income vs Expenses</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{new Date().getFullYear()} overview</p>
            </div>
          </div>
          <MonthlyAreaChart data={analytics?.monthly} isLoading={isLoading} currency={user?.currency} />
        </div>

        {/* Recent transactions */}
        <div className="xl:col-span-2 card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
            <a href="/transactions" className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </a>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8 text-gray-400 dark:text-gray-500">
              <div className="text-4xl mb-3">💳</div>
              <p className="font-medium text-sm">No transactions yet</p>
              <p className="text-xs mt-1">Add your first transaction to get started</p>
              <button onClick={() => setShowAdd(true)} className="btn-primary mt-4 text-xs px-4 py-2">
                <Plus size={14} /> Add Transaction
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-dark-600 -mx-2">
              {transactions.slice(0, 6).map((tx) => (
                <TransactionItem key={tx._id} transaction={tx} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Transaction">
        <TransactionForm onSuccess={() => setShowAdd(false)} onCancel={() => setShowAdd(false)} />
      </Modal>
    </div>
  );
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
};

export default Dashboard;
