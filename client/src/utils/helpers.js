// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format date
export const formatDate = (date, options = {}) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(new Date(date));
};

// Format date for input[type=date]
export const toInputDate = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

// Get month name
export const getMonthName = (monthNum) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthNum - 1] || '';
};

// Build monthly chart data from analytics
export const buildMonthlyChartData = (monthlyData) => {
  const months = Array.from({ length: 12 }, (_, i) => ({
    name: getMonthName(i + 1),
    income: 0,
    expense: 0,
  }));

  monthlyData?.forEach(({ _id, total }) => {
    const idx = _id.month - 1;
    if (idx >= 0 && idx < 12) {
      if (_id.type === 'income') months[idx].income = total;
      else months[idx].expense = total;
    }
  });

  return months;
};

// Clamp a number between min/max
export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

// Generate random hex color
export const randomColor = () =>
  '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');

// Debounce
export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// Export CSV
export const exportToCSV = (transactions, filename = 'transactions.csv') => {
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Notes'];
  const rows = transactions.map((t) => [
    formatDate(t.date),
    t.type,
    t.category,
    t.amount,
    t.notes || '',
  ]);

  const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

// Chart color palette
export const CHART_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#14b8a6', '#f97316', '#ec4899', '#3b82f6', '#84cc16',
  '#06b6d4', '#a855f7', '#e11d48', '#0ea5e9',
];
