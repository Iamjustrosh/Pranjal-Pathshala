import React, { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true); // for initial auth check

  // ✅ Redirect if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/admin', { replace: true });
      } else {
        setCheckingAuth(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (err) {
      console.error(err);
      setError('Invalid credentials');
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex justify-center items-center h-screen r">
        <p className="text-slate-600 text-sm md:text-base">Checking login status...</p>
      </div>
    );
  }

  return (
    <section className="flex justify-center items-center min-h-[80vh] r px-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleLogin}
          className="bg-white/95 border border-blue-100/70 rounded-3xl shadow-[0_22px_70px_rgba(148,163,184,0.35)] px-6 py-8 md:px-8 md:py-10 space-y-5"
        >
          <div className="text-center space-y-1 mb-2">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 poppins-medium">
              Secure Access
            </p>
            <h2 className="text-2xl md:text-3xl poppins-bold text-slate-900">Admin Login</h2>
            <p className="text-xs md:text-sm text-slate-500">
              Enter your credentials to manage quizzes, materials, and admissions.
            </p>
          </div>
          {error && <p className="text-red-500 text-center text-sm">{error}</p>}

          <div className="space-y-3">
            <div>
              <label className="block text-xs md:text-sm text-slate-600 mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-sm md:text-base bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm text-slate-600 mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-sm md:text-base bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#60A5FA] text-white py-2.5 rounded-xl text-sm md:text-base poppins-semibold shadow-[0_16px_40px_rgba(96,165,250,0.55)] hover:bg-[#3B82F6] hover:shadow-[0_20px_55px_rgba(96,165,250,0.7)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            Sign In
          </button>
        </form>
      </div>
    </section>
  );
};

export default Login;
