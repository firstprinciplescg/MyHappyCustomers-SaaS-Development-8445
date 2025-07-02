import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import StatsCard from '../dashboard/StatsCard';

const { FiDollarSign, FiCreditCard, FiTrendingUp, FiUsers, FiCalendar } = FiIcons;

const BillingManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock billing data - in real app, this would come from your billing provider
  const billingStats = {
    monthlyRevenue: 12450,
    activeSubscriptions: 147,
    churnRate: 3.2,
    avgRevenuePerUser: 84.69
  };

  const recentTransactions = [
    {
      id: 1,
      user: 'John Smith',
      email: 'john@business.com',
      amount: 29.99,
      plan: 'Pro',
      status: 'completed',
      date: new Date()
    },
    {
      id: 2,
      user: 'Sarah Johnson',
      email: 'sarah@company.com',
      amount: 49.99,
      plan: 'Premium',
      status: 'completed',
      date: new Date(Date.now() - 86400000)
    },
    {
      id: 3,
      user: 'Mike Davis',
      email: 'mike@startup.com',
      amount: 29.99,
      plan: 'Pro',
      status: 'failed',
      date: new Date(Date.now() - 172800000)
    }
  ];

  const subscriptionPlans = [
    {
      name: 'Free',
      price: 0,
      users: 89,
      features: ['Up to 10 customers', 'Basic analytics', 'Email support']
    },
    {
      name: 'Pro',
      price: 29.99,
      users: 124,
      features: ['Up to 100 customers', 'Advanced analytics', 'Priority support', 'Custom branding']
    },
    {
      name: 'Premium',
      price: 49.99,
      users: 23,
      features: ['Unlimited customers', 'White-label solution', '24/7 support', 'API access']
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Billing Management</h2>
          <p className="text-gray-600">Monitor revenue, subscriptions, and billing analytics</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 inline-flex">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'subscriptions', label: 'Subscriptions' },
          { key: 'transactions', label: 'Transactions' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Revenue Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Monthly Revenue"
              value={`$${billingStats.monthlyRevenue.toLocaleString()}`}
              icon={FiDollarSign}
              change="+12.5%"
              changeType="positive"
              color="success"
            />
            
            <StatsCard
              title="Active Subscriptions"
              value={billingStats.activeSubscriptions}
              icon={FiUsers}
              change="+8 this month"
              changeType="positive"
              color="primary"
            />
            
            <StatsCard
              title="Churn Rate"
              value={`${billingStats.churnRate}%`}
              icon={FiTrendingUp}
              change="-0.8%"
              changeType="positive"
              color="warning"
            />
            
            <StatsCard
              title="ARPU"
              value={`$${billingStats.avgRevenuePerUser}`}
              icon={FiCreditCard}
              change="+5.2%"
              changeType="positive"
              color="primary"
            />
          </div>

          {/* Revenue Chart Placeholder */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Revenue chart would be implemented here</p>
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-3xl font-bold text-primary-600 mt-2">
                    ${plan.price}<span className="text-sm text-gray-500">/month</span>
                  </p>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Active Users</span>
                    <span className="font-medium">{plan.users}</span>
                  </div>
                </div>

                <ul className="space-y-2 text-sm text-gray-600">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <SafeIcon icon={FiIcons.FiCheck} className="w-4 h-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.user}
                        </div>
                        <div className="text-sm text-gray-500">{transaction.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{transaction.plan}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        ${transaction.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(transaction.date, 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingManagement;