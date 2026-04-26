import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import useTransactionStore from '../../store/transactionStore';
import useCategoryStore from '../../store/categoryStore';
import { toInputDate } from '../../utils/helpers';

const schema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().max(500).optional(),
});

const TransactionForm = ({ transaction, onSuccess, onCancel }) => {
  const { addTransaction, updateTransaction } = useTransactionStore();
  const { categories } = useCategoryStore();
  const isEdit = !!transaction;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: transaction?.amount || '',
      type: transaction?.type || 'expense',
      category: transaction?.category || '',
      date: transaction ? toInputDate(transaction.date) : toInputDate(new Date()),
      notes: transaction?.notes || '',
    },
  });

  const selectedType = watch('type');
  const filteredCategories = categories.filter(
    (c) => c.type === selectedType || c.type === 'both'
  );

  const onSubmit = async (data) => {
    const result = isEdit
      ? await updateTransaction(transaction._id, data)
      : await addTransaction(data);

    if (result.success !== false) {
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Type selector */}
      <div>
        <label className="input-label">Transaction Type</label>
        <div className="grid grid-cols-2 gap-3">
          {['income', 'expense'].map((type) => (
            <label key={type} className="cursor-pointer">
              <input type="radio" value={type} {...register('type')} className="sr-only" />
              <div className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium text-sm transition-all duration-200 ${
                selectedType === type
                  ? type === 'income'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-600'
                    : 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:border-red-600'
                  : 'border-gray-200 dark:border-dark-400 text-gray-500 dark:text-gray-400 hover:border-gray-300'
              }`}>
                {type === 'income' ? '📈 Income' : '📉 Expense'}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="input-label">Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
          <input
            type="number"
            step="0.01"
            {...register('amount')}
            className="input pl-8"
            placeholder="0.00"
          />
        </div>
        {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="input-label">Category</label>
        <select {...register('category')} className="input">
          <option value="">Select a category</option>
          {filteredCategories.map((cat) => (
            <option key={cat._id} value={cat.name}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
      </div>

      {/* Date */}
      <div>
        <label className="input-label">Date</label>
        <input type="date" {...register('date')} className="input" />
        {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
      </div>

      {/* Notes */}
      <div>
        <label className="input-label">Notes <span className="text-gray-400">(optional)</span></label>
        <textarea
          {...register('notes')}
          className="input resize-none"
          rows={2}
          placeholder="Add a note..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
          {isSubmitting ? 'Saving...' : isEdit ? 'Update Transaction' : 'Add Transaction'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
