import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, Globe, Save, Shield } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/helpers';
import { clsx } from 'clsx';
import useDocumentTitle from '../hooks/useDocumentTitle';

const profileSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  currency: z.string(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const CURRENCIES = [
  { code: 'USD', label: 'US Dollar ($)' },
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'GBP', label: 'British Pound (£)' },
  { code: 'JPY', label: 'Japanese Yen (¥)' },
  { code: 'INR', label: 'Indian Rupee (₹)' },
  { code: 'CAD', label: 'Canadian Dollar (CA$)' },
  { code: 'AUD', label: 'Australian Dollar (A$)' },
];

const Profile = () => {
  useDocumentTitle('Profile');
  const { user, updateProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState('info');

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', email: user?.email || '', currency: user?.currency || 'USD' },
  });

  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });

  const onSaveProfile = async (data) => {
    const result = await updateProfile(data);
    if (result.success) toast.success('Profile updated!');
    else toast.error(result.message);
  };

  const onChangePassword = async (data) => {
    const result = await updateProfile({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    if (result.success) {
      toast.success('Password changed!');
      passwordForm.reset();
    } else {
      toast.error(result.message);
    }
  };

  const tabs = [
    { id: 'info', label: 'Personal Info', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account settings</p>
      </div>

      {/* Avatar card */}
      <div className="card flex items-center gap-5">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary-500/30 shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white">{user?.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Member since {formatDate(user?.createdAt)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-dark-700 p-1 rounded-xl w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === id ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
          )}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <div className="card animate-fade-in">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-5">Personal Information</h2>
          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
            <div>
              <label className="input-label">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" {...profileForm.register('name')} className="input pl-11" />
              </div>
              {profileForm.formState.errors.name && <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.name.message}</p>}
            </div>
            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" {...profileForm.register('email')} className="input pl-11" />
              </div>
              {profileForm.formState.errors.email && <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.email.message}</p>}
            </div>
            <div>
              <label className="input-label">Currency</label>
              <div className="relative">
                <Globe size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <select {...profileForm.register('currency')} className="input pl-11">
                  {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" disabled={profileForm.formState.isSubmitting} className="btn-primary gap-2">
              <Save size={15} /> {profileForm.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="card animate-fade-in">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-5">Change Password</h2>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
            {[
              { name: 'currentPassword', label: 'Current Password', placeholder: 'Enter current password' },
              { name: 'newPassword', label: 'New Password', placeholder: 'Min 6 characters' },
              { name: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Repeat new password' },
            ].map(({ name, label, placeholder }) => (
              <div key={name}>
                <label className="input-label">{label}</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password" {...passwordForm.register(name)} className="input pl-11" placeholder={placeholder} />
                </div>
                {passwordForm.formState.errors[name] && (
                  <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors[name].message}</p>
                )}
              </div>
            ))}
            <button type="submit" disabled={passwordForm.formState.isSubmitting} className="btn-primary gap-2">
              <Shield size={15} /> {passwordForm.formState.isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
