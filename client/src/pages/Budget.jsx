import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle, Target, TrendingDown, CheckCircle } from 'lucide-react';
import useBudgetStore from '../store/budgetStore';
import useAuthStore from '../store/authStore';
import { formatCurrency } from '../utils/helpers';
import { clsx } from 'clsx';
import useDocumentTitle from '../hooks/useDocumentTitle';

const schema = z.object({
  monthlyLimit: z.coerce.number().positive('Budget must be a positive number'),
  alertThreshold: z.coerce.number().min(1).max(100).optional(),
});

const Budget = () => {
  useDocumentTitle('Budget');
  const { budget, budgetInfo, isLoading, fetchBudget, setBudget } = useBudgetStore();
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { monthlyLimit: '', alertThreshold: 80 },
  });

  useEffect(() => {
    fetchBudget();
  }, []);

  useEffect(() => {
    if (budget) {
      reset({ monthlyLimit: budget.monthlyLimit, alertThreshold: budget.alertThreshold || 80 });
    }
  }, [budget]);

  const onSubmit = async (data) => {
    const result = await setBudget(data);
    if (result.success) {
      setIsEditing(false);
      fetchBudget();
    }
  };

  const { totalSpent = 0, percentUsed = 0, isOverBudget = false, spendingByCategory = [] } = budgetInfo || {};

  const getStatusColor = () => {
    if (isOverBudget) return 'bg-red-500';
    if (percentUsed > 80) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const getStatusMessage = () => {
    if (isOverBudget) return { icon: AlertTriangle, text: 'You\'ve exceeded your monthly budget!', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' };
    if (percentUsed > 80) return { icon: AlertTriangle, text: `Warning: You've used ${percentUsed}% of your budget.`, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' };
    return { icon: CheckCircle, text: 'You\'re on track with your budget! Keep it up.', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
  };

  const status = budget ? getStatusMessage() : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monthly spending limit & tracker</p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="btn-primary text-sm" id="edit-budget-btn">
            {budget ? 'Edit Budget' : 'Set Budget'}
          </button>
        )}
      </div>

      {/* Budget form */}
      {isEditing && (
        <div className="card animate-slide-up">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
            {budget ? 'Update Monthly Budget' : 'Set Monthly Budget'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="input-label">Monthly Limit ({user?.currency || 'USD'})</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                <input type="number" step="0.01" {...register('monthlyLimit')} className="input pl-8" placeholder="e.g. 3000" />
              </div>
              {errors.monthlyLimit && <p className="text-red-500 text-xs mt-1">{errors.monthlyLimit.message}</p>}
            </div>
            <div>
              <label className="input-label">Alert Threshold (%)</label>
              <input type="number" {...register('alertThreshold')} className="input" placeholder="80" min="1" max="100" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Get alerted when you reach this % of your budget</p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">{isSubmitting ? 'Saving...' : 'Save Budget'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Budget overview */}
      {!isLoading && budget && (
        <>
          {/* Status alert */}
          {status && (
            <div className={clsx('flex items-center gap-3 p-4 rounded-xl', status.bg)}>
              <status.icon size={20} className={status.color} />
              <p className={clsx('text-sm font-medium', status.color)}>{status.text}</p>
            </div>
          )}

          {/* Main progress card */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                  <Target size={22} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Monthly Budget</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{percentUsed}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">used</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative">
              <div className="w-full bg-gray-100 dark:bg-dark-500 rounded-full h-4 overflow-hidden">
                <div
                  className={clsx('h-4 rounded-full transition-all duration-1000 ease-out', getStatusColor())}
                  style={{ width: `${Math.min(percentUsed, 100)}%` }}
                />
              </div>
              {budget.alertThreshold && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-yellow-400"
                  style={{ left: `${budget.alertThreshold}%` }}
                  title={`Alert at ${budget.alertThreshold}%`}
                />
              )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[
                { label: 'Spent', value: totalSpent, color: 'text-red-600 dark:text-red-400' },
                { label: 'Remaining', value: Math.max(0, budget.monthlyLimit - totalSpent), color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Total Limit', value: budget.monthlyLimit, color: 'text-primary-600 dark:text-primary-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center p-3 bg-gray-50 dark:bg-dark-600 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                  <p className={clsx('font-bold text-sm', color)}>{formatCurrency(value, user?.currency)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Spending by category */}
          {spendingByCategory.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingDown size={18} className="text-red-500" />
                This Month's Spending
              </h2>
              <div className="space-y-3">
                {spendingByCategory
                  .sort((a, b) => b.total - a.total)
                  .map((item, i) => {
                    const pct = budget.monthlyLimit > 0 ? Math.round((item.total / budget.monthlyLimit) * 100) : 0;
                    const colors = ['bg-primary-500','bg-emerald-500','bg-yellow-500','bg-red-500','bg-purple-500','bg-pink-500'];
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{item._id}</span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {formatCurrency(item.total, user?.currency)} <span className="text-xs">({pct}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-dark-500 rounded-full h-2">
                          <div
                            className={clsx('h-2 rounded-full transition-all duration-700', colors[i % colors.length])}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </>
      )}

      {!isLoading && !budget && !isEditing && (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="text-5xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No budget set</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm">
            Set a monthly budget to track your spending and get alerts when you're close to the limit.
          </p>
          <button onClick={() => setIsEditing(true)} className="btn-primary">Set Monthly Budget</button>
        </div>
      )}
    </div>
  );
};

export default Budget;
