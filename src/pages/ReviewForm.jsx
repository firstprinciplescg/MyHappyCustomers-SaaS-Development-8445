import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { submitReview, createAlert } from '../lib/supabase';

const { FiStar, FiMessageSquare, FiThumbsUp, FiExternalLink } = FiIcons;

const ReviewForm = () => {
  const { customerId } = useParams();
  const [searchParams] = useSearchParams();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reviewOutcome, setReviewOutcome] = useState(null);

  const customerName = searchParams.get('name') || 'Valued Customer';
  const businessName = searchParams.get('business') || 'Our Business';

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const analyzeSentiment = (message, rating) => {
    // Simple sentiment analysis based on rating and keywords
    if (rating >= 4) return 'positive';
    if (rating <= 2) return 'negative';
    
    // Check message for negative keywords
    const negativeKeywords = ['bad', 'terrible', 'awful', 'disappointed', 'poor', 'worst'];
    const messageWords = message.toLowerCase().split(' ');
    const hasNegativeKeywords = negativeKeywords.some(keyword => 
      messageWords.includes(keyword)
    );
    
    return hasNegativeKeywords ? 'negative' : 'positive';
  };

  const onSubmit = async (data) => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      const sentiment = analyzeSentiment(data.message, rating);
      const isPublic = sentiment === 'positive';

      const reviewData = {
        customer_id: customerId,
        submitted_at: new Date().toISOString(),
        sentiment,
        is_public: isPublic,
        message: data.message,
        rating
      };

      await submitReview(reviewData);

      // Create alert for negative reviews
      if (sentiment === 'negative') {
        await createAlert({
          user_id: searchParams.get('userId'),
          review_id: null, // Would be set after review creation
          type: 'negative',
          created_at: new Date().toISOString()
        });
      }

      setReviewOutcome({ sentiment, isPublic });
      setSubmitted(true);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      toast.error('Failed to submit review. Please try again.');
      console.error('Error submitting review:', error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center"
        >
          {reviewOutcome?.sentiment === 'positive' ? (
            <>
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={FiThumbsUp} className="w-8 h-8 text-success-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Thank you for your positive feedback!
              </h2>
              <p className="text-gray-600 mb-6">
                We're thrilled you had a great experience. Would you mind sharing your review publicly to help others discover {businessName}?
              </p>
              <div className="space-y-3">
                <a
                  href="https://www.google.com/search?q=your+business+reviews"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Leave Google Review</span>
                  <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
                </a>
                <button
                  onClick={() => window.close()}
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={FiMessageSquare} className="w-8 h-8 text-warning-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Thank you for your feedback
              </h2>
              <p className="text-gray-600 mb-6">
                We appreciate you taking the time to share your experience. Your feedback helps us improve our service. Someone from our team may reach out to address your concerns.
              </p>
              <button
                onClick={() => window.close()}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Close
              </button>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiStar} className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            How was your experience?
          </h1>
          <p className="text-gray-600">
            Hi {customerName}, we'd love to hear about your experience with {businessName}
          </p>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-8 rounded-2xl shadow-lg space-y-6"
        >
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Overall Rating *
            </label>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-2 transition-transform hover:scale-110"
                >
                  <SafeIcon
                    icon={FiStar}
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-center mt-2">
              <span className="text-sm text-gray-600">
                {rating === 0 && 'Please select a rating'}
                {rating === 1 && 'Very Poor'}
                {rating === 2 && 'Poor'}
                {rating === 3 && 'Average'}
                {rating === 4 && 'Good'}
                {rating === 5 && 'Excellent'}
              </span>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tell us about your experience
            </label>
            <div className="relative">
              <SafeIcon icon={FiMessageSquare} className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <textarea
                {...register('message', { required: 'Please share your experience' })}
                rows={4}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Share details about your experience..."
              />
            </div>
            {errors.message && (
              <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || rating === 0}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default ReviewForm;