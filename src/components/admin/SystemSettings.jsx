import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiSettings, FiMail, FiDatabase, FiShield, FiAlertTriangle } = FiIcons;

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);

  const handleDatabaseMaintenance = async () => {
    if (!confirm('This will optimize database performance but may take a few minutes. Continue?')) {
      return;
    }

    setLoading(true);
    try {
      // Simulate database maintenance
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Database maintenance completed successfully');
    } catch (error) {
      console.error('Error during maintenance:', error);
      toast.error('Database maintenance failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBackupDatabase = async () => {
    toast.info('Database backup initiated. You will receive an email when complete.');
    // In a real app, this would trigger a backup process
  };

  const systemStats = [
    { label: 'Database Size', value: '2.4 GB', status: 'normal' },
    { label: 'Active Connections', value: '47', status: 'normal' },
    { label: 'Memory Usage', value: '67%', status: 'warning' },
    { label: 'Disk Usage', value: '34%', status: 'normal' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <p className="text-gray-600">Configure system-wide settings and maintenance</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 inline-flex">
        {[
          { key: 'general', label: 'General', icon: FiSettings },
          { key: 'database', label: 'Database', icon: FiDatabase },
          { key: 'email', label: 'Email', icon: FiMail },
          { key: 'security', label: 'Security', icon: FiShield }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <SafeIcon icon={tab.icon} className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Version
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">v1.0.0</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Environment
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">Production</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Deployment
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Uptime
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">99.9%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {systemStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">{stat.label}</span>
                  <span className={`text-sm font-medium ${getStatusColor(stat.status)}`}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Database Tab */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Management</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Optimize Database</h4>
                  <p className="text-sm text-gray-600">Run VACUUM and ANALYZE to optimize performance</p>
                </div>
                <button
                  onClick={handleDatabaseMaintenance}
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? 'Running...' : 'Optimize'}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Create Backup</h4>
                  <p className="text-sm text-gray-600">Generate a full database backup</p>
                </div>
                <button
                  onClick={handleBackupDatabase}
                  className="px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700"
                >
                  Backup
                </button>
              </div>

              <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Database Maintenance</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Regular maintenance helps keep your database running smoothly. 
                      Consider scheduling automatic maintenance during low-traffic periods.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Tab */}
      {activeTab === 'email' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Provider
              </label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option>SendGrid</option>
                <option>Mailgun</option>
                <option>Amazon SES</option>
                <option>Custom SMTP</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Email
              </label>
              <input
                type="email"
                placeholder="noreply@myhappycustomers.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="password"
                placeholder="••••••••••••••••"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Test Email Configuration
            </button>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Authentication</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Require email verification</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600" />
                  <span className="ml-2 text-sm text-gray-700">Enable two-factor authentication</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Password Policy</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Minimum 8 characters</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Require uppercase and lowercase</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600" />
                  <span className="ml-2 text-sm text-gray-700">Require special characters</span>
                </label>
              </div>
            </div>

            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Save Security Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemSettings;