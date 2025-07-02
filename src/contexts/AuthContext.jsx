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

        // Create user profile if it's a new sign up
        if (event === 'SIGNED_UP' && session?.user) {
          try {
            const existingProfile = await getUserProfile(session.user.id);
            if (!existingProfile) {
              await createUserProfile({
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || '',
                business_name: session.user.user_metadata?.business_name || ''
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
    signOut,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};