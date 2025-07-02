import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import StatsCard from '../components/dashboard/StatsCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import { getAnalytics } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const { FiUsers, FiMail, FiStar, FiBell, FiTrendingUp } = FiIcons;

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await getAnalytics(user.id);
        setAnalytics(data);
      } catch (error) {
        console.error('Error loading analytics:', error);
        // Set default analytics for demo
        setAnalytics({
          totalCustomers: 0,
          totalRequests: 0,
          totalReviews: 0,
          positiveReviews: 0,
          negativeReviews: 0,
          conversionRate: 0,
          unreadAlerts: 0
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadAnalytics();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.user_metadata?.name || user?.email}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Customers"
          value={analytics?.totalCustomers || 0}
          icon={FiUsers}
          color="primary"
        />
        <StatsCard
          title="Review Requests"
          value={analytics?.totalRequests || 0}
          icon={FiMail}
          color="primary"
        />
        <StatsCard
          title="Reviews Received"
          value={analytics?.totalReviews || 0}
          icon={FiStar}
          color="success"
        />
        <StatsCard
          title="Conversion Rate"
          value={`${analytics?.conversionRate || 0}%`}
          icon={FiTrendingUp}
          color="success"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Positive Reviews"
          value={analytics?.positiveReviews || 0}
          icon={FiStar}
          color="success"
        />
        <StatsCard
          title="Negative Feedback"
          value={analytics?.negativeReviews || 0}
          icon={FiBell}
          color="warning"
        />
        <StatsCard
          title="Unread Alerts"
          value={analytics?.unreadAlerts || 0}
          icon={FiBell}
          color="danger"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a
              href="/customers"
              className="flex items-center justify-between p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                  <FiUsers className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Add Customer</p>
                  <p className="text-sm text-gray-600">Start collecting reviews</p>
                </div>
              </div>
              <FiIcons.FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500" />
            </a>

            <a
              href="/reviews"
              className="flex items-center justify-between p-4 bg-success-50 rounded-lg hover:bg-success-100 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success-500 rounded-lg flex items-center justify-center">
                  <FiStar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Reviews</p>
                  <p className="text-sm text-gray-600">Check latest feedback</p>
                </div>
              </div>
              <FiIcons.FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-success-500" />
            </a>

            <a
              href="/alerts"
              className="flex items-center justify-between p-4 bg-warning-50 rounded-lg hover:bg-warning-100 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-warning-500 rounded-lg flex items-center justify-center">
                  <FiBell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Check Alerts</p>
                  <p className="text-sm text-gray-600">Review notifications</p>
                </div>
              </div>
              <FiIcons.FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-warning-500" />
            </a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;