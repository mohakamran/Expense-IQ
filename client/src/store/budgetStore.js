import { create } from 'zustand';
import { budgetService } from '../services';
import toast from 'react-hot-toast';

const useBudgetStore = create((set) => ({
  budget: null,
  budgetInfo: null,
  isLoading: false,

  fetchBudget: async () => {
    set({ isLoading: true });
    try {
      const { data } = await budgetService.get();
      set({ budget: data.data.budget, budgetInfo: data.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setBudget: async (budgetData) => {
    try {
      const { data } = await budgetService.set(budgetData);
      set({ budget: data.data });
      toast.success('Budget updated!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to set budget');
      return { success: false };
    }
  },
}));

export default useBudgetStore;
