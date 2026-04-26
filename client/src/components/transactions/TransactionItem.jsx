import { useState } from 'react';
import { Pencil, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import useTransactionStore from '../../store/transactionStore';
import useAuthStore from '../../store/authStore';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Modal from '../ui/Modal';
import TransactionForm from './TransactionForm';
import { clsx } from 'clsx';

const TransactionItem = ({ transaction }) => {
  const { deleteTransaction } = useTransactionStore();
  const { user } = useAuthStore();
  const [showEdit, setShowEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isIncome = transaction.type === 'income';

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteTransaction(transaction._id);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors duration-150 group animate-slide-up">
        {/* Icon */}
        <div className={clsx(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg',
          isIncome ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'
        )}>
          {isIncome
            ? <ArrowUpRight size={18} className="text-emerald-600 dark:text-emerald-400" />
            : <ArrowDownRight size={18} className="text-red-600 dark:text-red-400" />
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{transaction.category}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {formatDate(transaction.date)}
            {transaction.notes && ` · ${transaction.notes}`}
          </p>
        </div>

        {/* Amount */}
        <div className="text-right">
          <p className={clsx(
            'font-semibold text-sm',
            isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          )}>
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency || user?.currency)}
          </p>
          <span className={clsx('badge text-xs', isIncome ? 'badge-income' : 'badge-expense')}>
            {transaction.type}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={() => setShowEdit(true)}
            className="btn-icon text-primary-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
            aria-label="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            className="btn-icon text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            aria-label="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Edit modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Transaction">
        <TransactionForm
          transaction={transaction}
          onSuccess={() => setShowEdit(false)}
          onCancel={() => setShowEdit(false)}
        />
      </Modal>

      {/* Delete confirmation modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirm Delete">
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">Are you sure you want to delete this transaction? This action cannot be undone.</p>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleDelete} disabled={isDeleting} className="btn-danger flex-1">
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TransactionItem;
