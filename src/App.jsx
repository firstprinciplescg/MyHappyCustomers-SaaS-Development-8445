import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { isAdminUser } from './lib/supabase';
import Layout from './components/layout/Layout';
import AdminLayout from './components/admin/AdminLayout';
import AuthForm from './components/auth/AuthForm';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Reviews from './pages/Reviews';
import ReviewForm from './pages/ReviewForm';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import SystemAnalytics from './components/admin/SystemAnalytics';
import BillingManagement from './components/admin/BillingManagement';
import SystemSettings from './components/admin/SystemSettings';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/auth" replace />;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdminUser(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (user) {
    return isAdminUser(user) ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <AuthForm />
          </PublicRoute>
        }
      />

      {/* Review Form - Public but specific */}
      <Route path="/review/:customerId" element={<ReviewForm />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="analytics" element={<SystemAnalytics />} />
        <Route path="billing" element={<BillingManagement />} />
        <Route path="system" element={<SystemSettings />} />
      </Route>

      {/* Protected User Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="requests" element={<Dashboard />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="alerts" element={<Dashboard />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05)',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;