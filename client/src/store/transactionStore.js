import { create } from 'zustand';
import { transactionService } from '../services';
import toast from 'react-hot-toast';

const useTransactionStore = create((set, get) => ({
  transactions: [],
  analytics: null,
  isLoading: false,
  pagination: { page: 1, pages: 1, total: 0 },
  filters: { type: '', category: '', startDate: '', endDate: '' },

  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  clearFilters: () => set({ filters: { type: '', category: '', startDate: '', endDate: '' } }),

  fetchTransactions: async (params = {}) => {
    set({ isLoading: true });
    try {
      const { filters } = get();
      const cleanParams = {};
      Object.entries({ ...filters, ...params }).forEach(([k, v]) => { if (v) cleanParams[k] = v; });

      const { data } = await transactionService.getAll(cleanParams);
      set({
        transactions: data.data,
        pagination: { page: data.page, pages: data.pages, total: data.total },
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to load transactions');
    }
  },

  addTransaction: async (transactionData) => {
    try {
      const { data } = await transactionService.create(transactionData);
      set((state) => {
        if (state.transactions.some((t) => t._id === data.data._id)) return state;
        return { transactions: [data.data, ...state.transactions] };
      });
      toast.success('Transaction added!');
      return { success: true, data: data.data };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add transaction');
      return { success: false };
    }
  },

  updateTransaction: async (id, transactionData) => {
    try {
      const { data } = await transactionService.update(id, transactionData);
      set((state) => ({
        transactions: state.transactions.map((t) => (t._id === id ? data.data : t)),
      }));
      toast.success('Transaction updated!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update transaction');
      return { success: false };
    }
  },

  deleteTransaction: async (id) => {
    try {
      await transactionService.delete(id);
      set((state) => ({ transactions: state.transactions.filter((t) => t._id !== id) }));
      toast.success('Transaction deleted');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete transaction');
      return { success: false };
    }
  },

  fetchAnalytics: async (params = {}) => {
    try {
      const { data } = await transactionService.getAnalytics(params);
      set({ analytics: data.data });
    } catch (error) {
      toast.error('Failed to load analytics');
    }
  },

  // Real-time handlers
  handleSocketAdd: (transaction) => {
    set((state) => {
      if (state.transactions.some((t) => t._id === transaction._id)) return state;
      return { transactions: [transaction, ...state.transactions] };
    });
  },
  handleSocketUpdate: (transaction) => {
    set((state) => ({
      transactions: state.transactions.map((t) => (t._id === transaction._id ? transaction : t)),
    }));
  },
  handleSocketDelete: ({ id }) => {
    set((state) => ({ transactions: state.transactions.filter((t) => t._id !== id) }));
  },
}));

export default useTransactionStore;
