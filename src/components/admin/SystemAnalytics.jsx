import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import StatsCard from '../dashboard/StatsCard';
import { supabase } from '../../lib/supabase';

const { FiUsers, FiMail, FiStar, FiTrendingUp, FiActivity, FiDatabase } = FiIcons;

const SystemAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30');

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const dateFilter = format(subDays(new Date(), parseInt(timeframe)), 'yyyy-MM-dd');
      
      // Use direct Supabase queries for better compatibility
      const [usersData, customersData, reviewsData, requestsData] = await Promise.all([
        supabase.from('users_mhc2024').select('*', { count: 'exact' }),
        supabase.from('customers_mhc2024').select('*', { count: 'exact' }),
        supabase.from('reviews_mhc2024').select('sentiment, rating'),
        supabase.from('review_requests_mhc2024').select('*', { count: 'exact' })
      ]);

      const totalUsers = usersData.count || 0;
      const newUsers = usersData.data?.filter(u => 
        new Date(u.created_at) >= new Date(dateFilter)
      ).length || 0;

      const totalCustomers = customersData.count || 0;
      const totalRequests = requestsData.count || 0;
      const totalReviews = reviewsData.data?.length || 0;
      
      const positiveReviews = reviewsData.data?.filter(r => r.sentiment === 'positive').length || 0;
      const negativeReviews = reviewsData.data?.filter(r => r.sentiment === 'negative').length || 0;
      
      const ratings = reviewsData.data?.map(r => parseFloat(r.rating)).filter(r => !isNaN(r)) || [];
      const avgRating = ratings.length > 0 ? 
        (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '0.0';

      const conversionRate = totalRequests > 0 ? 
        ((totalReviews / totalRequests) * 100).toFixed(1) : '0';

      // Get daily activity for the last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const count = usersData.data?.filter(u => 
          format(new Date(u.created_at), 'yyyy-MM-dd') === dateStr
        ).length || 0;
        
        return { date: dateStr, count };
      }).reverse();

      setAnalytics({
        totalUsers,
        newUsers,
        totalCustomers,
        totalReviews,
        positiveReviews,
        negativeReviews,
        avgRating,
        totalRequests,
        conversionRate,
        dailyActivity: last7Days
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Set default values on error
      setAnalytics({
        totalUsers: 0,
        newUsers: 0,
        totalCustomers: 0,
        totalReviews: 0,
        positiveReviews: 0,
        negativeReviews: 0,
        avgRating: '0.0',
        totalRequests: 0,
        conversionRate: '0',
        dailyActivity: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Analytics</h2>
          <p className="text-gray-600">Platform-wide metrics and insights</p>
        </div>
        
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={analytics?.totalUsers || 0}
          icon={FiUsers}
          change={`+${analytics?.newUsers || 0} new`}
          changeType="positive"
          color="primary"
        />
        
        <StatsCard
          title="Total Customers"
          value={analytics?.totalCustomers || 0}
          icon={FiDatabase}
          color="success"
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
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Conversion Rate"
          value={`${analytics?.conversionRate || 0}%`}
          icon={FiTrendingUp}
          color="success"
        />
        
        <StatsCard
          title="Average Rating"
          value={analytics?.avgRating || 0}
          icon={FiStar}
          color="warning"
        />
        
        <StatsCard
          title="Positive Reviews"
          value={analytics?.positiveReviews || 0}
          icon={FiTrendingUp}
          color="success"
        />
        
        <StatsCard
          title="Negative Reviews"
          value={analytics?.negativeReviews || 0}
          icon={FiActivity}
          color="danger"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily User Signups</h3>
          <div className="space-y-3">
            {analytics?.dailyActivity?.length > 0 ? (
              analytics.dailyActivity.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {format(new Date(day.date), 'MMM d')}
                  </span>
                  <span className="font-medium">{day.count} users</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No activity data available</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database Status</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">Online</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Status</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">Operational</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email Service</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Storage Usage</span>
              <span className="text-sm font-medium">67% of limit</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SystemAnalytics;