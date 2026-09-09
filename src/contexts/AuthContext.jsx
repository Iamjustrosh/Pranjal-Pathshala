import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [studentUser, setStudentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setCurrentUser(session?.user ?? null);

      const storedStudent = localStorage.getItem('studentUser');

      if (storedStudent) {
        try {
          setStudentUser(JSON.parse(storedStudent));
        } catch (e) {
          console.error('Failed to parse student user', e);
        }
      }

      setLoading(false);
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginStudent = (data) => {
    localStorage.setItem('studentUser', JSON.stringify(data));
    setStudentUser(data);
  };

  const logoutStudent = () => {
    localStorage.removeItem('studentUser');
    setStudentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        studentUser,
        loginStudent,
        logoutStudent,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};