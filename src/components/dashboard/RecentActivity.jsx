import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiMail, FiStar, FiAlertCircle, FiUser } = FiIcons;

const RecentActivity = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'review_request':
        return FiMail;
      case 'review_submitted':
        return FiStar;
      case 'alert_created':
        return FiAlertCircle;
      case 'customer_added':
        return FiUser;
      default:
        return FiMail;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'review_request':
        return 'text-primary-600 bg-primary-50';
      case 'review_submitted':
        return 'text-success-600 bg-success-50';
      case 'alert_created':
        return 'text-warning-600 bg-warning-50';
      case 'customer_added':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Mock activities if none provided
  const mockActivities = [
    {
      id: 1,
      type: 'customer_added',
      title: 'New customer added',
      description: 'John Smith was added to your customer list',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 2,
      type: 'review_request',
      title: 'Review request sent',
      description: 'Review request sent to Sarah Johnson',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
    },
    {
      id: 3,
      type: 'review_submitted',
      title: 'New review received',
      description: 'Mike Davis left a 5-star review',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
    },
    {
      id: 4,
      type: 'alert_created',
      title: 'Negative feedback alert',
      description: 'Customer expressed dissatisfaction',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000)
    }
  ];

  const displayActivities = activities.length > 0 ? activities : mockActivities;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      
      <div className="space-y-4">
        {displayActivities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start space-x-3"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
              <SafeIcon icon={getActivityIcon(activity.type)} className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-sm text-gray-600">{activity.description}</p>
              <p className="text-xs text-gray-400 mt-1">
                {format(activity.timestamp, 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {displayActivities.length === 0 && (
        <div className="text-center py-8">
          <SafeIcon icon={FiMail} className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No recent activity</p>
          <p className="text-sm text-gray-400">Activity will appear here as you use the platform</p>
        </div>
      )}
    </motion.div>
  );
};

export default RecentActivity;