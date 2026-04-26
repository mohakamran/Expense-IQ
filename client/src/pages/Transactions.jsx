import { useEffect, useState } from 'react';
import { Plus, Filter, Search, Download, X, ChevronLeft, ChevronRight } from 'lucide-react';
import useTransactionStore from '../store/transactionStore';
import useCategoryStore from '../store/categoryStore';
import useAuthStore from '../store/authStore';
import TransactionItem from '../components/transactions/TransactionItem';
import TransactionForm from '../components/transactions/TransactionForm';
import Modal from '../components/ui/Modal';
import { exportToCSV, formatCurrency } from '../utils/helpers';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Transactions = () => {
  useDocumentTitle('Transactions');
  const { user } = useAuthStore();
  const {
    transactions, analytics, isLoading, pagination, filters,
    fetchTransactions, fetchAnalytics, setFilters, clearFilters,
  } = useTransactionStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [showAdd, setShowAdd] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCategories();
    fetchTransactions({ page: currentPage });
    fetchAnalytics({ year: new Date().getFullYear(), month: 'all' });
  }, [currentPage]);

  const { income = 0, expenses = 0, balance = 0 } = analytics?.totals || {};

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ [name]: value });
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchTransactions({ page: 1 });
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    clearFilters();
    setCurrentPage(1);
    fetchTransactions({ page: 1 });
  };

  const hasActiveFilters = filters.type || filters.category || filters.startDate || filters.endDate;

  const filteredTransactions = searchText
    ? transactions.filter((t) =>
        t.category.toLowerCase().includes(searchText.toLowerCase()) ||
        t.notes?.toLowerCase().includes(searchText.toLowerCase())
      )
    : transactions;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {pagination.total} total transactions
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportToCSV(transactions)}
            className="btn-secondary gap-2 text-sm"
            title="Export to CSV"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => setShowFilters(true)}
            className={`btn-secondary gap-2 text-sm ${hasActiveFilters ? 'border-primary-500 text-primary-600 dark:text-primary-400' : ''}`}
          >
            <Filter size={15} />
            <span className="hidden sm:inline">Filter</span>
            {hasActiveFilters && <span className="w-2 h-2 bg-primary-500 rounded-full" />}
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-primary gap-2 text-sm" id="add-tx-btn">
            <Plus size={15} />
            Add
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Net Balance</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(balance, user?.currency)}
          </p>
        </div>
        <div className="card bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30">
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Total Income</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(income, user?.currency)}
          </p>
        </div>
        <div className="card bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">Total Expenses</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(expenses, user?.currency)}
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search by category or notes..."
          className="input pl-11"
        />
        {searchText && (
          <button onClick={() => setSearchText('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Active filter tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">Filters:</span>
          {filters.type && (
            <span className={`badge ${filters.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
              {filters.type}
            </span>
          )}
          {filters.category && <span className="badge bg-gray-100 text-gray-700 dark:bg-dark-500 dark:text-gray-300">{filters.category}</span>}
          {filters.startDate && <span className="badge bg-gray-100 text-gray-700 dark:bg-dark-500 dark:text-gray-300">From: {filters.startDate}</span>}
          {filters.endDate && <span className="badge bg-gray-100 text-gray-700 dark:bg-dark-500 dark:text-gray-300">To: {filters.endDate}</span>}
          <button onClick={handleClearFilters} className="text-xs text-red-500 hover:underline flex items-center gap-1">
            <X size={11} /> Clear all
          </button>
        </div>
      )}

      {/* Transaction list */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-gray-50 dark:divide-dark-600">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-32 rounded" />
                  <div className="skeleton h-2 w-24 rounded" />
                </div>
                <div className="skeleton h-5 w-20 rounded" />
              </div>
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
            <div className="text-5xl mb-4">📭</div>
            <p className="font-semibold text-base">No transactions found</p>
            <p className="text-sm mt-1">Try adjusting your filters or add a new transaction</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-dark-600">
            {filteredTransactions.map((tx) => (
              <TransactionItem key={tx._id} transaction={tx} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn-secondary p-2 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={currentPage === pagination.pages}
              className="btn-secondary p-2 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Transaction">
        <TransactionForm onSuccess={() => setShowAdd(false)} onCancel={() => setShowAdd(false)} />
      </Modal>

      {/* Filter Modal */}
      <Modal isOpen={showFilters} onClose={() => setShowFilters(false)} title="Filter Transactions">
        <div className="space-y-4">
          <div>
            <label className="input-label">Type</label>
            <select name="type" value={filters.type} onChange={handleFilterChange} className="input">
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div>
            <label className="input-label">Category</label>
            <select name="category" value={filters.category} onChange={handleFilterChange} className="input">
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">From</label>
              <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="input" />
            </div>
            <div>
              <label className="input-label">To</label>
              <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="input" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { handleClearFilters(); setShowFilters(false); }} className="btn-secondary flex-1">Clear</button>
            <button onClick={handleApplyFilters} className="btn-primary flex-1">Apply Filters</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Transactions;
