import { clsx } from 'clsx';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <div className={clsx(
        'rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin',
        sizes[size]
      )} />
    </div>
  );
};

export const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-dark-900 z-50">
    <div className="text-center space-y-4">
      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary-500/30 animate-pulse">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading ExpenseIQ...</p>
    </div>
  </div>
);

export const CardSkeleton = ({ rows = 3 }) => (
  <div className="card space-y-4 animate-pulse">
    <div className="skeleton h-5 w-32 rounded" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="skeleton h-10 rounded-xl" />
    ))}
  </div>
);

export const StatSkeleton = () => (
  <div className="card animate-pulse">
    <div className="flex items-center gap-4">
      <div className="skeleton w-12 h-12 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-6 w-28 rounded" />
      </div>
    </div>
  </div>
);

export default LoadingSpinner;
