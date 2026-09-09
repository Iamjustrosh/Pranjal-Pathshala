import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [appUser, setAppUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAppUser = async (user) => {
    if (!user) {
      setAppUser(null);
      return null;
    }

    const { data, error } = await supabase
      .from('app_users')
      .select(`
        auth_user_id,
        role,
        student_id,
        status
      `)
      .eq('auth_user_id', user.id)
      .single();

    if (error) {
      console.error('Failed to load app user:', error);
      setAppUser(null);
      return null;
    }

    setAppUser(data);
    return data;
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session: existingSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error(
            'Failed to restore auth session:',
            error
          );
        }

        if (!mounted) return;

        setSession(existingSession ?? null);
        setCurrentUser(
          existingSession?.user ?? null
        );

        if (existingSession?.user) {
          await loadAppUser(
            existingSession.user
          );
        } else {
          setAppUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!mounted) return;

        setSession(nextSession ?? null);
        setCurrentUser(
          nextSession?.user ?? null
        );

        if (!nextSession?.user) {
          setAppUser(null);
          setLoading(false);
          return;
        }

        setLoading(true);

        setTimeout(async () => {
          await loadAppUser(
            nextSession.user
          );

          if (mounted) {
            setLoading(false);
          }
        }, 0);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    setSession(null);
    setCurrentUser(null);
    setAppUser(null);
  };

  const value = {
    session,
    currentUser,
    appUser,

    role: appUser?.role ?? null,
    studentId:
      appUser?.student_id ?? null,
    accountStatus:
      appUser?.status ?? null,

    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};