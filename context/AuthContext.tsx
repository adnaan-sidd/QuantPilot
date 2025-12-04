import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any, data: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any, data: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: null, data: {} }),
  signUp: async () => ({ error: null, data: {} }),
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
        console.warn("Supabase not configured. Auth will be simulated.");
        setLoading(false);
        return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { data, error };
    } else {
        // Mock Login
        const mockUser = { 
            id: 'mock-user-123', 
            email, 
            user_metadata: { full_name: 'Demo User' },
            app_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString()
        } as any;
        setUser(mockUser);
        setSession({ access_token: 'mock-token', user: mockUser } as any);
        return { data: { user: mockUser, session: { access_token: 'mock-token' } }, error: null };
    }
  }

  const signUp = async (email, password, fullName) => {
      if (supabase) {
           return await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
          });
      } else {
          // Mock Signup
          const mockUser = { 
            id: 'mock-user-123', 
            email, 
            user_metadata: { full_name: fullName },
            app_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString()
          } as any;
          setUser(mockUser);
          setSession({ access_token: 'mock-token', user: mockUser } as any);
          return { data: { user: mockUser, session: { access_token: 'mock-token' } }, error: null };
      }
  }

  const signOut = async () => {
    if (supabase) {
        await supabase.auth.signOut();
    } else {
        setUser(null);
        setSession(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);