import { useEffect, useState } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import useCategoryStore from '../store/categoryStore';
import Modal from '../components/ui/Modal';
import { clsx } from 'clsx';
import useDocumentTitle from '../hooks/useDocumentTitle';

const ICONS = ['📦','🏠','🚗','🍔','💻','🏥','📚','✈️','🎮','🛍️','⚡','💰','📈','🎯','🏋️','🎵','🐾','🌿','🔧','🎨'];
const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#f97316','#ec4899','#3b82f6','#84cc16'];

const CategoryCard = ({ cat, onEdit, onDelete }) => (
  <div className="flex items-center gap-3 p-3 bg-white dark:bg-dark-700 rounded-xl border border-gray-100 dark:border-dark-500 hover:shadow-sm transition-all group">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: cat.color + '20' }}>
      {cat.icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{cat.name}</p>
      <p className="text-xs text-gray-400 capitalize">{cat.type}</p>
    </div>
    {!cat.isDefault ? (
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(cat)} className="btn-icon text-primary-500 hover:text-primary-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
        </button>
        <button onClick={() => onDelete(cat)} className="btn-icon text-red-400 hover:text-red-600">
          <Trash2 size={14} />
        </button>
      </div>
    ) : (
      <span className="text-xs text-gray-400 bg-gray-100 dark:bg-dark-500 px-2 py-0.5 rounded-full">Default</span>
    )}
  </div>
);

const Categories = () => {
  useDocumentTitle('Categories');
  const { categories, isLoading, fetchCategories, addCategory, updateCategory, deleteCategory } = useCategoryStore();
  const [showForm, setShowForm] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [catToDelete, setCatToDelete] = useState(null);
  const [form, setForm] = useState({ name: '', icon: '📦', color: '#6366f1' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('expense');

  useEffect(() => { fetchCategories(); }, []);

  const filtered = categories.filter((c) => c.type === activeTab || c.type === 'both');
  const defaults = filtered.filter((c) => c.isDefault);
  const custom = filtered.filter((c) => !c.isDefault);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setIsSubmitting(true);
    let result;
    if (editingCat) {
      result = await updateCategory(editingCat._id, form);
    } else {
      result = await addCategory({ ...form, type: activeTab });
    }
    if (result.success) { setShowForm(false); setForm({ name: '', icon: '📦', color: '#6366f1' }); setEditingCat(null); }
    setIsSubmitting(false);
  };

  const handleEdit = (cat) => {
    setEditingCat(cat);
    setForm({ name: cat.name, icon: cat.icon, color: cat.color });
    setShowForm(true);
  };

  const openDeleteConfirm = (cat) => {
    setCatToDelete(cat);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!catToDelete) return;
    setIsSubmitting(true);
    await deleteCategory(catToDelete._id);
    setIsSubmitting(false);
    setShowDeleteConfirm(false);
    setCatToDelete(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{categories.length} total</p>
        </div>
        <button onClick={() => { setEditingCat(null); setForm({ name: '', icon: '📦', color: '#6366f1' }); setShowForm(true); }} className="btn-primary gap-2 text-sm" id="add-category-btn">
          <Plus size={15} /> Add Category
        </button>
      </div>

      <div className="flex gap-1 bg-gray-100 dark:bg-dark-700 p-1 rounded-xl w-fit">
        {['expense','income'].map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} className={clsx(
            'px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize',
            activeTab === t ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
          )}>
            {t === 'expense' ? '📉' : '📈'} {t}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {custom.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Tag size={14} className="text-primary-500" /> Custom
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {custom.map((cat) => <CategoryCard key={cat._id} cat={cat} onEdit={handleEdit} onDelete={openDeleteConfirm} />)}
              </div>
            </div>
          )}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Tag size={14} className="text-gray-400" /> Defaults
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {defaults.map((cat) => <CategoryCard key={cat._id} cat={cat} onEdit={handleEdit} onDelete={openDeleteConfirm} />)}
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingCat ? "Edit Category" : "Add Custom Category"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="e.g. Gym, Subscriptions..." required maxLength={30} />
          </div>
          <div>
            <label className="input-label">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((icon) => (
                <button key={icon} type="button" onClick={() => setForm({ ...form, icon })} className={clsx('w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all', form.icon === icon ? 'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-500' : 'bg-gray-100 dark:bg-dark-600 hover:bg-gray-200')}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="input-label">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button key={color} type="button" onClick={() => setForm({ ...form, color })} className={clsx('w-8 h-8 rounded-full transition-all', form.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105')} style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">{isSubmitting ? 'Saving...' : (editingCat ? 'Update' : 'Add')}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirm Delete">
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">Are you sure you want to delete the "{catToDelete?.name}" category?</p>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleDelete} disabled={isSubmitting} className="btn-danger flex-1">
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Categories;
