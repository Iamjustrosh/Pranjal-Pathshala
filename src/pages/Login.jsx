import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('student'); // Toggle: 'student' or 'admin'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Form Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [dob, setDob] = useState('');

  // Styles
  const inputClass = "w-full border border-slate-200 px-3 py-2.5 rounded-xl text-sm md:text-base bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent transition-all duration-200";
  const labelClass = "block text-xs md:text-sm text-slate-600 mb-1 poppins-medium";
  const buttonClass = "w-full bg-[#60A5FA] text-white py-2.5 rounded-xl text-sm md:text-base poppins-semibold shadow-[0_16px_40px_rgba(96,165,250,0.55)] hover:bg-[#3B82F6] hover:shadow-[0_20px_55px_rgba(96,165,250,0.7)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed";

  // Check Auth & Persistence
  useEffect(() => {
    // 1. Check if Student is already logged in via LocalStorage
    const studentData = localStorage.getItem('studentUser');
    if (studentData) {
      navigate('/student-dashboard', { replace: true });
      return;
    }

    // 2. Check if Admin is logged in via Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/admin', { replace: true });
      } else {
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (err) {
      console.error(err);
      setError('Invalid Admin Credentials');
    }
    setLoading(false);
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check credentials in Supabase
      const { data, error } = await supabase
        .from('coaching_students')
        .select('*')
        .eq('username', username)
        .eq('dob', dob)
        .single();

      if (error || !data) {
        throw new Error('Invalid Username or Date of Birth');
      }

      // Store session
      localStorage.setItem('studentUser', JSON.stringify(data));
      navigate('/student-dashboard');
    } catch (err) {
      setError('Invalid Username or Date of Birth');
    }
    setLoading(false);
  };

  if (checkingAuth) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <p className="text-slate-600 text-sm md:text-base animate-pulse">Checking existing session...</p>
      </div>
    );
  }

  return (
    <section className="flex justify-center items-center min-h-[80vh] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white/95 border border-blue-100/70 rounded-3xl shadow-[0_22px_70px_rgba(148,163,184,0.35)] px-6 py-8 md:px-8 md:py-10 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-1">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 poppins-medium">
              Pranjal Pathshala
            </p>
            <h2 className="text-2xl md:text-3xl poppins-bold text-slate-900">
              {role === 'admin' ? 'Admin Login' : 'Student Portal'}
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              {role === 'admin' 
                ? 'Enter credentials to manage the system.' 
                : 'Login to view your marks and profile.'}
            </p>
          </div>

          {/* Role Toggle Switch */}
          <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => { setRole('student'); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                role === 'student' 
                  ? 'bg-white text-blue-600 shadow-md ring-1 ring-black/5' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => { setRole('admin'); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                role === 'admin' 
                  ? 'bg-white text-blue-600 shadow-md ring-1 ring-black/5' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 text-center text-sm py-2 rounded-xl animate-fade-in">
              {error}
            </div>
          )}

          {/* Forms */}
          {role === 'admin' ? (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="email">Email</label>
                <input
                  id="email" type="email" placeholder="admin@example.com"
                  className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="password">Password</label>
                <input
                  id="password" type="password" placeholder="••••••••"
                  className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} required
                />
              </div>
              <button type="submit" disabled={loading} className={buttonClass}>
                {loading ? 'Authenticating...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="username">Username</label>
                <input
                  id="username" type="text" placeholder="Enter Your UID"
                  className={inputClass} value={username} onChange={(e) => setUsername(e.target.value)} required
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={labelClass} htmlFor="dob">Date of Birth</label>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Use as Password</span>
                </div>
                <input
                  id="dob" type="date"
                  className={inputClass} value={dob} onChange={(e) => setDob(e.target.value)} required
                />
              </div>
              <button type="submit" disabled={loading} className={buttonClass}>
                {loading ? 'Verifying...' : 'Login'}
              </button>
            </form>
          )}

        </div>
      </div>
    </section>
  );
};

export default Login;