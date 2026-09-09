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

  useEffect(() => {
    let mounted = true;
    let request = 0;
    let userId = null;
    let profileLoaded = false;
    let authEventReceived = false;

    const applySession = (nextSession) => {
      if (!mounted) return;
      const version = ++request;
      const nextId = nextSession?.user?.id ?? null;
      const identityChanged = nextId !== userId;
      userId = nextId;
      setSession(nextSession ?? null);
      setCurrentUser(nextSession?.user ?? null);
      if (!nextId) {
        profileLoaded = false;
        setAppUser(null);
        setLoading(false);
        return;
      }
      if (identityChanged) {
        profileLoaded = false;
        setAppUser(null);
      }
      // Same-user refreshes must not unmount the protected page and its drafts.
      const background = profileLoaded;
      if (!background) setLoading(true);
      // Leave the Supabase auth callback before querying its client.
      setTimeout(async () => {
        if (!mounted || version !== request) return;
        try {
          const { data, error } = await supabase.from('app_users')
            .select('auth_user_id, role, student_id, status')
            .eq('auth_user_id', nextId).maybeSingle();
          if (!mounted || version !== request) return;
          if (error) throw error;
          setAppUser(data);
          profileLoaded = true;
        } catch (error) {
          if (!mounted || version !== request) return;
          console.error('Failed to load app user:', error);
          if (!background) setAppUser(null);
        } finally {
          if (mounted && version === request) setLoading(false);
        }
      }, 0);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      authEventReceived = true;
      applySession(nextSession);
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted || authEventReceived) return;
      if (error) console.error('Failed to restore auth session:', error);
      applySession(data?.session ?? null);
    }).catch(error => {
      if (!mounted || authEventReceived) return;
      console.error('Failed to restore auth session:', error);
      applySession(null);
    });
    return () => {
      mounted = false;
      ++request;
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