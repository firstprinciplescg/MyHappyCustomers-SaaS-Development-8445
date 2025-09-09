import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, createUserProfile, getUserProfile } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);

        // Create user profile if it's a new sign up or sign in (for OAuth)
        if ((event === 'SIGNED_UP' || event === 'SIGNED_IN') && session?.user) {
          try {
            const existingProfile = await getUserProfile(session.user.id);
            if (!existingProfile) {
              // Extract name from Google user metadata or use email
              const displayName = session.user.user_metadata?.full_name || 
                                session.user.user_metadata?.name || 
                                session.user.email?.split('@')[0] || '';
              
              // Extract business name from email domain or use provided value
              const emailDomain = session.user.email?.split('@')[1] || '';
              const defaultBusinessName = session.user.user_metadata?.business_name || 
                                        (emailDomain && emailDomain !== 'gmail.com' && emailDomain !== 'yahoo.com' && emailDomain !== 'hotmail.com' && emailDomain !== 'outlook.com'
                                          ? emailDomain.split('.')[0].charAt(0).toUpperCase() + emailDomain.split('.')[0].slice(1)
                                          : '');

              await createUserProfile({
                id: session.user.id,
                email: session.user.email,
                name: displayName,
                business_name: defaultBusinessName
              });
            }
          } catch (error) {
            console.error('Error creating user profile:', error);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, userData) => {
    // Get the current origin for email redirects
    const redirectTo = window.location.origin + window.location.pathname;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: redirectTo
      }
    });

    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  };

  const signInWithGoogle = async () => {
    const redirectTo = window.location.origin + '/#/dashboard';
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo
      }
    });
    
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email) => {
    // Use current origin for password reset redirects too
    const redirectTo = window.location.origin + '/#/auth';
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo
    });
    
    if (error) throw error;
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};