import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import CustomerForm from '../components/customers/CustomerForm';
import CustomerList from '../components/customers/CustomerList';
import { getCustomers } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const { FiPlus } = FiIcons;

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  const loadCustomers = async () => {
    try {
      const data = await getCustomers(user.id);
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadCustomers();
    }
  }, [user]);

  const handleCustomerAdded = () => {
    setShowForm(false);
    loadCustomers();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">
            Manage your customers and send review requests
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <SafeIcon icon={FiPlus} className="w-5 h-5" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Customer Form */}
      {showForm && (
        <CustomerForm
          onSuccess={handleCustomerAdded}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Customer List */}
      <CustomerList customers={customers} loading={loading} />
    </motion.div>
  );
};

export default Customers;