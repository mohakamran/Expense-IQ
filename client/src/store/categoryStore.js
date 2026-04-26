import { create } from 'zustand';
import { categoryService } from '../services';
import toast from 'react-hot-toast';

const useCategoryStore = create((set) => ({
  categories: [],
  isLoading: false,

  fetchCategories: async () => {
    set({ isLoading: true });
    try {
      const { data } = await categoryService.getAll();
      set({ categories: data.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addCategory: async (categoryData) => {
    try {
      const { data } = await categoryService.create(categoryData);
      set((state) => ({ categories: [...state.categories, data.data] }));
      toast.success('Category added!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add category');
      return { success: false };
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      const { data } = await categoryService.update(id, categoryData);
      set((state) => ({
        categories: state.categories.map((c) => (c._id === id ? data.data : c)),
      }));
      toast.success('Category updated!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update category');
      return { success: false };
    }
  },

  deleteCategory: async (id) => {
    try {
      await categoryService.delete(id);
      set((state) => ({ categories: state.categories.filter((c) => c._id !== id) }));
      toast.success('Category deleted');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
      return { success: false };
    }
  },
}));

export default useCategoryStore;
