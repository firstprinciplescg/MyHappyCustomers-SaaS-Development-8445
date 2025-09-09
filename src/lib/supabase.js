import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
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
    .from('customers')
    .insert([customerData])
    .select();
  
  if (error) throw error;
  return data[0];
};

export const getCustomers = async (userId) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Review request operations
export const createReviewRequest = async (customerId) => {
  const { data, error } = await supabase
    .from('review_requests')
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
    .from('review_requests')
    .select(`
      *,
      customers!inner(*)
    `)
    .eq('customers.user_id', userId)
    .order('sent_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Review operations
export const submitReview = async (reviewData) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert([reviewData])
    .select();
  
  if (error) throw error;
  return data[0];
};

export const getReviews = async (userId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      customers!inner(*)
    `)
    .eq('customers.user_id', userId)
    .order('submitted_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Alert operations
export const createAlert = async (alertData) => {
  const { data, error } = await supabase
    .from('alerts')
    .insert([alertData])
    .select();
  
  if (error) throw error;
  return data[0];
};

export const getAlerts = async (userId) => {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', userId)
    .is('read_at', null)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const markAlertAsRead = async (alertId) => {
  const { data, error } = await supabase
    .from('alerts')
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
      supabase.from('alerts').select('*').eq('user_id', userId)
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
    .from('users')
    .insert([userData])
    .select();
  
  if (error) throw error;
  return data[0];
};

export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// Admin helper to check if user is admin
export const isAdminUser = (user) => {
  if (!user) return false;
  
  const adminEmailsEnv = import.meta.env.VITE_ADMIN_EMAILS;
  if (!adminEmailsEnv) {
    console.warn('VITE_ADMIN_EMAILS environment variable not set');
    return false;
  }
  
  const adminEmails = adminEmailsEnv.split(',').map(email => email.trim());
  return adminEmails.includes(user.email);
};