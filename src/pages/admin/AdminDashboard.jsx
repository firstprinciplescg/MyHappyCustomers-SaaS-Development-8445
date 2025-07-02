import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import StatsCard from '../../components/dashboard/StatsCard';
import { supabase } from '../../lib/supabase';

const { FiUsers, FiActivity, FiDollarSign, FiTrendingUp, FiAlertCircle } = FiIcons;

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      // Use direct Supabase queries for better compatibility
      const [usersData, customersData, reviewsData, requestsData] = await Promise.all([
        supabase.from('users_mhc2024').select('*', { count: 'exact' }),
        supabase.from('customers_mhc2024').select('*', { count: 'exact' }),
        supabase.from('reviews_mhc2024').select('*', { count: 'exact' }),
        supabase.from('review_requests_mhc2024').select('*', { count: 'exact' })
      ]);

      setStats({
        totalUsers: usersData.count || 0,
        totalCustomers: customersData.count || 0,
        totalReviews: reviewsData.count || 0,
        totalRequests: requestsData.count || 0
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
      // Set default values on error
      setStats({
        totalUsers: 0,
        totalCustomers: 0,
        totalReviews: 0,
        totalRequests: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-gray-600">System overview and key metrics</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={FiUsers}
          color="primary"
        />
        
        <StatsCard
          title="Total Customers"
          value={stats?.totalCustomers || 0}
          icon={FiActivity}
          color="success"
        />
        
        <StatsCard
          title="Reviews Generated"
          value={stats?.totalReviews || 0}
          icon={FiTrendingUp}
          color="warning"
        />
        
        <StatsCard
          title="Requests Sent"
          value={stats?.totalRequests || 0}
          icon={FiDollarSign}
          color="primary"
        />
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Status</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">Operational</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">Connected</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email Service</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a
              href="/admin/users"
              className="flex items-center justify-between p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <FiUsers className="w-5 h-5 text-primary-600" />
                <span className="font-medium text-gray-900">Manage Users</span>
              </div>
              <FiIcons.FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500" />
            </a>

            <a
              href="/admin/analytics"
              className="flex items-center justify-between p-3 bg-success-50 rounded-lg hover:bg-success-100 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <FiTrendingUp className="w-5 h-5 text-success-600" />
                <span className="font-medium text-gray-900">View Analytics</span>
              </div>
              <FiIcons.FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-success-500" />
            </a>

            <a
              href="/admin/system"
              className="flex items-center justify-between p-3 bg-warning-50 rounded-lg hover:bg-warning-100 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <FiAlertCircle className="w-5 h-5 text-warning-600" />
                <span className="font-medium text-gray-900">System Settings</span>
              </div>
              <FiIcons.FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-warning-500" />
            </a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;