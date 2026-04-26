import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, Area, AreaChart,
} from 'recharts';
import { buildMonthlyChartData, formatCurrency, CHART_COLORS } from '../../utils/helpers';

// Custom tooltip
const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-dark-700 border border-gray-100 dark:border-dark-500 rounded-xl p-3 shadow-xl text-sm">
      {label && <p className="font-medium text-gray-900 dark:text-white mb-2">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-gray-600 dark:text-gray-400 capitalize">{entry.name}:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {typeof entry.value === 'number' ? formatCurrency(entry.value, currency) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// Monthly Income vs Expense — Area Chart
export const MonthlyAreaChart = ({ data, isLoading, currency }) => {
  const chartData = buildMonthlyChartData(data || []);

  if (isLoading) return <div className="skeleton h-64 rounded-xl" />;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-dark-500" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`} />
        <Tooltip content={<CustomTooltip currency={currency} />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)" dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
        <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" dot={{ r: 3, fill: '#ef4444' }} activeDot={{ r: 5 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// Income vs Expense — Bar Chart
export const IncomeExpenseBarChart = ({ data, isLoading, currency }) => {
  const chartData = buildMonthlyChartData(data || []);

  if (isLoading) return <div className="skeleton h-64 rounded-xl" />;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-dark-500" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`} />
        <Tooltip content={<CustomTooltip currency={currency} />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="Income" />
        <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} name="Expense" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Expenses by Category — Pie Chart
export const CategoryPieChart = ({ data, isLoading, currency }) => {
  if (isLoading) return <div className="skeleton h-64 rounded-xl" />;
  if (!data?.length) return (
    <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500 text-sm">
      No expense data available
    </div>
  );

  const RADIAN = Math.PI / 180;
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row items-center gap-4">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="_id"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={50}
            labelLine={false}
            label={renderLabel}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [formatCurrency(value, currency), name]}
            contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0' }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-col gap-2 min-w-[140px] max-h-56 overflow-y-auto">
        {data.slice(0, 8).map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
            <span className="text-gray-600 dark:text-gray-400 truncate flex-1">{item._id}</span>
            <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(item.total, currency)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
