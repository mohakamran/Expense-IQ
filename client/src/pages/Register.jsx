import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, TrendingUp, Mail, Lock, User } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useDocumentTitle from '../hooks/useDocumentTitle';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const Register = () => {
  useDocumentTitle('Register');
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    const { confirmPassword, ...userData } = data;
    const result = await registerUser(userData);
    if (result.success) {
      toast.success('Account created! Welcome to ExpenseIQ 🎉');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-primary-600 to-purple-700 relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full -translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 text-white space-y-8 max-w-md">
          <div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
              <TrendingUp size={28} />
            </div>
            <h1 className="text-4xl font-bold mb-3">Start your journey</h1>
            <p className="text-primary-200 text-lg leading-relaxed">
              Join thousands who've taken control of their finances with ExpenseIQ.
            </p>
          </div>
          <div className="space-y-4">
            {['✅ Free to use, no credit card required', '📊 Beautiful analytics & charts', '🔒 Bank-level security', '⚡ Real-time updates'].map((f) => (
              <div key={f} className="flex items-center gap-3 text-primary-100">
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-dark-900">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <TrendingUp size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">ExpenseIQ</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create account</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Start tracking your expenses today</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="input-label">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" {...register('name')} className="input pl-11" placeholder="John Doe" autoComplete="name" />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="input-label">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" {...register('email')} className="input pl-11" placeholder="you@example.com" autoComplete="email" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="input pl-11 pr-11"
                  placeholder="Min 6 characters"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="input-label">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" {...register('confirmPassword')} className="input pl-11" placeholder="Repeat password" autoComplete="new-password" />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button id="register-btn" type="submit" disabled={isLoading} className="btn-primary w-full py-3 text-base mt-2">
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
