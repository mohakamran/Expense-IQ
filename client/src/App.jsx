import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/ui/ProtectedRoute';
import useAuthStore from './store/authStore';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Budget from './pages/Budget';
import Categories from './pages/Categories';
import Profile from './pages/Profile';

const App = () => {
  const { checkAuth } = useAuthStore();

  // Verify stored token on mount
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: 'var(--toast-bg, #fff)',
            color: 'var(--toast-color, #111)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
            fontSize: '14px',
            fontWeight: 500,
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
