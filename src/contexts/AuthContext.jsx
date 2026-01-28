import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // Firebase Admin
  const [studentUser, setStudentUser] = useState(null); // Student
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Firebase Admin Check
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // 2. Student LocalStorage Check
    const storedStudent = localStorage.getItem('studentUser');
    if (storedStudent) {
      try {
        setStudentUser(JSON.parse(storedStudent));
      } catch (e) {
        console.error("Failed to parse student user", e);
      }
    }
    
    return unsubscribe;
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
    <AuthContext.Provider value={{ currentUser, studentUser, loginStudent, logoutStudent, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};