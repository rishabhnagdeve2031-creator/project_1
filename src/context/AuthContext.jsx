import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the role for a given user ID
  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }
      return data?.role || null;
    } catch (err) {
      console.error('Error in fetchUserRole:', err);
      return null;
    }
  };

  useEffect(() => {
    // Check active session on load
    const initializeAuth = async () => {
      try {
        // Check for local demo session first
        const savedDemoUser = localStorage.getItem('demo_user');
        const savedDemoRole = localStorage.getItem('demo_role');
        if (savedDemoUser && savedDemoRole) {
          setUser(JSON.parse(savedDemoUser));
          setRole(savedDemoRole);
          setLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const userRole = await fetchUserRole(session.user.id);
          setRole(userRole);
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // If we are logged in as a demo user, ignore Supabase auth changes
      if (localStorage.getItem('demo_user')) return;

      setLoading(true);
      if (session?.user) {
        setUser(session.user);
        const userRole = await fetchUserRole(session.user.id);
        setRole(userRole);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Login action
  const login = async (email, password) => {
    setLoading(true);

    // Intercept demo login
    if (email === 'demo@pench.gov.in' && password === 'demo123') {
      const demoUser = { id: 'demo-official-id', email: 'demo@pench.gov.in', user_metadata: { name: 'Demo Officer' } };
      const demoRole = 'forest_official';
      setUser(demoUser);
      setRole(demoRole);
      localStorage.setItem('demo_user', JSON.stringify(demoUser));
      localStorage.setItem('demo_role', demoRole);
      setLoading(false);
      return { user: demoUser };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      throw error;
    }

    if (data?.user) {
      // Fetch role to ensure they are an authorized official
      const userRole = await fetchUserRole(data.user.id);
      if (!userRole) {
        // Sign out if they don't have a role assigned
        await supabase.auth.signOut();
        setLoading(false);
        throw new Error('Access denied. You are not registered as a Forest Department official.');
      }
      setUser(data.user);
      setRole(userRole);
    }
    setLoading(false);
    return data;
  };

  // Logout action
  const logout = async () => {
    setLoading(true);
    localStorage.removeItem('demo_user');
    localStorage.removeItem('demo_role');
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signout issue:', e);
    }
    setUser(null);
    setRole(null);
    setLoading(false);
  };

  const value = {
    user,
    role,
    loading,
    login,
    logout,
    isOfficial: role === 'forest_official' || role === 'admin',
    isAdmin: role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
