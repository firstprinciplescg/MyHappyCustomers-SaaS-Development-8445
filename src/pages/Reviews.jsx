import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { getReviews } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const { FiStar, FiThumbsUp, FiThumbsDown, FiMessageSquare } = FiIcons;

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await getReviews(user.id);
        setReviews(data);
      } catch (error) {
        console.error('Error loading reviews:', error);
        // Set mock data for demo
        setReviews([
          {
            id: 1,
            submitted_at: new Date().toISOString(),
            sentiment: 'positive',
            is_public: true,
            message: 'Excellent service! Very professional and timely.',
            customers: { name: 'John Smith', email: 'john@example.com' }
          },
          {
            id: 2,
            submitted_at: new Date(Date.now() - 86400000).toISOString(),
            sentiment: 'negative',
            is_public: false,
            message: 'Service was delayed and communication could be better.',
            customers: { name: 'Sarah Johnson', email: 'sarah@example.com' }
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadReviews();
    }
  }, [user]);

  const filteredReviews = reviews.filter(review => {
    if (filter === 'positive') return review.sentiment === 'positive';
    if (filter === 'negative') return review.sentiment === 'negative';
    if (filter === 'public') return review.is_public;
    if (filter === 'private') return !review.is_public;
    return true;
  });

  const getSentimentIcon = (sentiment) => {
    return sentiment === 'positive' ? FiThumbsUp : FiThumbsDown;
  };

  const getSentimentColor = (sentiment) => {
    return sentiment === 'positive' 
      ? 'text-success-600 bg-success-50' 
      : 'text-danger-600 bg-danger-50';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600 mt-1">
            View and manage customer feedback
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 inline-flex">
        {[
          { key: 'all', label: 'All Reviews' },
          { key: 'positive', label: 'Positive' },
          { key: 'negative', label: 'Negative' },
          { key: 'public', label: 'Public' },
          { key: 'private', label: 'Private' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getSentimentColor(review.sentiment)}`}>
                    <SafeIcon icon={getSentimentIcon(review.sentiment)} className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{review.customers.name}</h3>
                    <p className="text-sm text-gray-600">{review.customers.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    review.is_public 
                      ? 'bg-success-100 text-success-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {review.is_public ? 'Public' : 'Private'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {format(new Date(review.submitted_at), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <SafeIcon icon={FiMessageSquare} className="w-5 h-5 text-gray-400 mt-1" />
                <p className="text-gray-700 flex-1">{review.message}</p>
              </div>

              {review.sentiment === 'positive' && review.is_public && (
                <div className="mt-4 p-3 bg-success-50 rounded-lg">
                  <p className="text-sm text-success-800">
                    ✅ This positive review was shared publicly and can help attract new customers!
                  </p>
                </div>
              )}

              {review.sentiment === 'negative' && !review.is_public && (
                <div className="mt-4 p-3 bg-warning-50 rounded-lg">
                  <p className="text-sm text-warning-800">
                    ⚠️ This feedback was kept private. Consider reaching out to address their concerns.
                  </p>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <SafeIcon icon={FiStar} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600 mb-6">
              Reviews will appear here once customers start submitting feedback.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Reviews;