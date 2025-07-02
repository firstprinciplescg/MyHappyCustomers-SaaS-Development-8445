import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';

const StatsCard = ({ title, value, icon, change, changeType, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary-500 text-primary-600 bg-primary-50',
    success: 'bg-success-500 text-success-600 bg-success-50',
    warning: 'bg-warning-500 text-warning-600 bg-warning-50',
    danger: 'bg-danger-500 text-danger-600 bg-danger-50'
  };

  const [bgColor, textColor, bgLight] = colorClasses[color].split(' ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${
                changeType === 'positive' ? 'text-success-600' : 
                changeType === 'negative' ? 'text-danger-600' : 'text-gray-600'
              }`}>
                {change}
              </span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${bgLight} rounded-lg flex items-center justify-center`}>
          <SafeIcon icon={icon} className={`w-6 h-6 ${textColor}`} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;