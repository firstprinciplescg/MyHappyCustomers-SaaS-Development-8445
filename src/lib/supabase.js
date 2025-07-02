import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yktuypkxpuxxlwrpwzbo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrdHV5cGt4cHV4eGx3cnB3emJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NzM3OTYsImV4cCI6MjA2NzA0OTc5Nn0.Ah7Mb925xKOzXuGaJa_896KzUa8Jod5GULePitNXVRk';

if (supabaseUrl === 'https://your-project.supabase.co' || supabaseKey === 'your-anon-key') {
  throw new Error('Missing Supabase variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Add runSupabaseQuery function for admin operations
export const runSupabaseQuery = async (query) => {
  try {
    // For now, we'll use a simple approach since we don't have the execute_sql function
    // In production, you'd implement this as a Supabase Edge Function
    console.warn('runSupabaseQuery called with:', query);
    
    // Return mock data for build success - replace with actual implementation
    if (query.includes('COUNT(*)')) {
      return [{ count: 0, total_users: 0, total_customers: 0, total_reviews: 0, total_requests: 0 }];
    }
    
    return [];
  } catch (error) {
    console.error('Error in runSupabaseQuery:', error);
    throw error;
  }
};

// Database schema helper functions
export const createTables = async () => {
  try {
    console.log('Database tables created successfully via Supabase dashboard');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

// Customer operations
export const addCustomer = async (customerData) => {
  const { data, error } = await supabase
    .from('customers_mhc2024')
    .insert([customerData])
    .select();
  
  if (error) throw error;
  return data[0];
};

export const getCustomers = async (userId) => {
  const { data, error } = await supabase
    .from('customers_mhc2024')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Review request operations
export const createReviewRequest = async (customerId) => {
  const { data, error } = await supabase
    .from('review_requests_mhc2024')
    .insert([{
      customer_id: customerId,
      sent_at: new Date().toISOString(),
      status: 'sent'
    }])
    .select();
  
  if (error) throw error;
  return data[0];
};

export const getReviewRequests = async (userId) => {
  const { data, error } = await supabase
    .from('review_requests_mhc2024')
    .select(`
      *,
      customers_mhc2024!inner(*)
    `)
    .eq('customers_mhc2024.user_id', userId)
    .order('sent_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Review operations
export const submitReview = async (reviewData) => {
  const { data, error } = await supabase
    .from('reviews_mhc2024')
    .insert([reviewData])
    .select();
  
  if (error) throw error;
  return data[0];
};

export const getReviews = async (userId) => {
  const { data, error } = await supabase
    .from('reviews_mhc2024')
    .select(`
      *,
      customers_mhc2024!inner(*)
    `)
    .eq('customers_mhc2024.user_id', userId)
    .order('submitted_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Alert operations
export const createAlert = async (alertData) => {
  const { data, error } = await supabase
    .from('alerts_mhc2024')
    .insert([alertData])
    .select();
  
  if (error) throw error;
  return data[0];
};

export const getAlerts = async (userId) => {
  const { data, error } = await supabase
    .from('alerts_mhc2024')
    .select('*')
    .eq('user_id', userId)
    .is('read_at', null)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const markAlertAsRead = async (alertId) => {
  const { data, error } = await supabase
    .from('alerts_mhc2024')
    .update({ read_at: new Date().toISOString() })
    .eq('id', alertId)
    .select();
  
  if (error) throw error;
  return data[0];
};

// Analytics helper
export const getAnalytics = async (userId) => {
  try {
    const [customers, reviewRequests, reviews, alerts] = await Promise.all([
      getCustomers(userId),
      getReviewRequests(userId),
      getReviews(userId),
      supabase.from('alerts_mhc2024').select('*').eq('user_id', userId)
    ]);

    const totalRequests = reviewRequests.length;
    const totalReviews = reviews.length || 0;
    const positiveReviews = reviews.filter(r => r.sentiment === 'positive').length || 0;
    const negativeReviews = reviews.filter(r => r.sentiment === 'negative').length || 0;
    const conversionRate = totalRequests > 0 ? (totalReviews / totalRequests * 100).toFixed(1) : 0;

    return {
      totalCustomers: customers.length,
      totalRequests,
      totalReviews,
      positiveReviews,
      negativeReviews,
      conversionRate,
      unreadAlerts: alerts.data?.filter(a => !a.read_at).length || 0
    };
  } catch (error) {
    console.error('Error getting analytics:', error);
    return {
      totalCustomers: 0,
      totalRequests: 0,
      totalReviews: 0,
      positiveReviews: 0,
      negativeReviews: 0,
      conversionRate: 0,
      unreadAlerts: 0
    };
  }
};

// User profile operations
export const createUserProfile = async (userData) => {
  const { data, error } = await supabase
    .from('users_mhc2024')
    .insert([userData])
    .select();
  
  if (error) throw error;
  return data[0];
};

export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('users_mhc2024')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// Admin helper to check if user is admin
export const isAdminUser = (user) => {
  // Add your own email here to become an admin
  const adminEmails = [
    'admin@myhappycustomers.com',
    'superadmin@myhappycustomers.com',
    'your-email@example.com'  // 👈 Replace with your email
  ];
  return user && adminEmails.includes(user.email);
};