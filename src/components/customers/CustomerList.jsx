import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiMail, FiPhone, FiCalendar, FiTag } = FiIcons;

const CustomerList = ({ customers, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!customers || customers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <SafeIcon icon={FiIcons.FiUsers} className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No customers yet</h3>
        <p className="text-gray-600">Add your first customer to get started with review requests.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Customers</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {customers.map((customer, index) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-medium text-gray-900">{customer.name}</h4>
                  {customer.tags && customer.tags.length > 0 && (
                    <div className="flex space-x-1">
                      {customer.tags.slice(0, 2).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800"
                        >
                          <SafeIcon icon={FiTag} className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                      {customer.tags.length > 2 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                          +{customer.tags.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiMail} className="w-4 h-4" />
                    <span>{customer.email}</span>
                  </div>
                  
                  {customer.phone && (
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={FiPhone} className="w-4 h-4" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiCalendar} className="w-4 h-4" />
                    <span>
                      Service: {format(new Date(customer.service_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  Added {format(new Date(customer.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CustomerList;