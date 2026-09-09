
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();

  const {
    currentUser,
    appUser,
    loading: authLoading,
  } = useAuth();

  const [role, setRole] = useState('student');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Admin form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Student form
  const [username, setUsername] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showStudentPassword, setShowStudentPassword] = useState(false);

  // Styles
  const inputClass =
    'w-full border border-slate-200 px-3 py-2.5 rounded-xl text-sm md:text-base bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent transition-all duration-200';

  const labelClass =
    'block text-xs md:text-sm text-slate-600 mb-1 poppins-medium';

  const buttonClass =
    'w-full bg-[#60A5FA] text-white py-2.5 rounded-xl text-sm md:text-base poppins-semibold shadow-[0_16px_40px_rgba(96,165,250,0.55)] hover:bg-[#3B82F6] hover:shadow-[0_20px_55px_rgba(96,165,250,0.7)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed';

  // Redirect an already authenticated user to the correct dashboard.
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!currentUser || !appUser) {
      return;
    }

    // A disabled account should not remain authenticated.
    if (appUser.status !== 'active') {
      const clearDisabledSession = async () => {
        await supabase.auth.signOut();
        setError('Your account is currently disabled.');
      };

      clearDisabledSession();
      return;
    }

    if (
      appUser.role === 'admin' ||
      appUser.role === 'super_admin'
    ) {
      navigate('/admin', { replace: true });
      return;
    }

    if (appUser.role === 'student') {
      navigate('/student-dashboard', {
        replace: true,
      });
    }
  }, [
    authLoading,
    currentUser,
    appUser,
    navigate,
  ]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const {
        data,
        error: signInError,
      } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError || !data.user) {
        throw new Error('Invalid admin credentials');
      }

      const {
        data: identity,
        error: identityError,
      } = await supabase
        .from('app_users')
        .select('role, student_id, status')
        .eq('auth_user_id', data.user.id)
        .single();

      if (identityError || !identity) {
        await supabase.auth.signOut();

        throw new Error(
          'Admin identity is not configured correctly.'
        );
      }

      if (
        identity.role !== 'admin' &&
        identity.role !== 'super_admin'
      ) {
        await supabase.auth.signOut();

        throw new Error(
          'This account does not have admin access.'
        );
      }

      if (identity.status !== 'active') {
        await supabase.auth.signOut();

        setError('Your admin account is currently disabled.');
        return;
      }

      navigate('/admin', {
        replace: true,
      });
    } catch (err) {
      console.error('Admin login error:', err);

      if (
        err.message ===
        'Admin identity is not configured correctly.'
      ) {
        setError(
          'Admin account is not configured correctly.'
        );
      } else if (
        err.message ===
        'This account does not have admin access.'
      ) {
        setError(
          'This account does not have admin access.'
        );
      } else {
        setError('Invalid Admin Credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    const normalizedUsername = username
      .trim()
      .toLowerCase();

    const internalEmail =
      `${normalizedUsername}@students.pranjalpathshala.local`;

    try {
      const {
        data,
        error: signInError,
      } = await supabase.auth.signInWithPassword({
        email: internalEmail,
        password: studentPassword,
      });

      if (signInError || !data.user) {
        throw new Error('Invalid credentials');
      }

      const {
        data: identity,
        error: identityError,
      } = await supabase
        .from('app_users')
        .select('role, student_id, status')
        .eq('auth_user_id', data.user.id)
        .single();

      if (identityError || !identity) {
        await supabase.auth.signOut();

        throw new Error(
          'Student identity not found'
        );
      }

      if (identity.role !== 'student') {
        await supabase.auth.signOut();

        throw new Error(
          'This account is not a student account'
        );
      }

      if (identity.status !== 'active') {
        await supabase.auth.signOut();

        setError(
          'Your student account is currently disabled.'
        );

        return;
      }

      navigate('/student-dashboard', {
        replace: true,
      });
    } catch (err) {
      console.error('Student login error:', err);

      if (
        err.message === 'Student identity not found'
      ) {
        setError(
          'Student account is not configured correctly.'
        );
      } else if (
        err.message ===
        'This account is not a student account'
      ) {
        setError(
          'This account is not a student account.'
        );
      } else {
        setError(
          'Invalid Username or Password'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (nextRole) => {
    setRole(nextRole);
    setError('');

    // Clear passwords whenever switching login type.
    setPassword('');
    setStudentPassword('');
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <p className="text-slate-600 text-sm md:text-base animate-pulse">
          Checking existing session...
        </p>
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
              {role === 'admin'
                ? 'Admin Login'
                : 'Student Portal'}
            </h2>

            <p className="text-xs md:text-sm text-slate-500">
              {role === 'admin'
                ? 'Enter credentials to manage the system.'
                : 'Login to view your marks and profile.'}
            </p>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
            <button
              type="button"
              onClick={() =>
                handleRoleChange('student')
              }
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                role === 'student'
                  ? 'bg-white text-blue-600 shadow-md ring-1 ring-black/5'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              Student
            </button>

            <button
              type="button"
              onClick={() =>
                handleRoleChange('admin')
              }
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
            <div className="bg-red-50 border border-red-100 text-red-500 text-center text-sm py-2 px-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Admin Login */}
          {role === 'admin' ? (
            <form
              onSubmit={handleAdminLogin}
              className="space-y-4"
            >
              <div>
                <label
                  className={labelClass}
                  htmlFor="email"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  className={inputClass}
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label
                  className={labelClass}
                  htmlFor="admin-password"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="admin-password"
                    type={
                      showAdminPassword
                        ? 'text'
                        : 'password'
                    }
                    placeholder="••••••••"
                    className={`${inputClass} pr-11`}
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowAdminPassword(
                        (prev) => !prev
                      )
                    }
                    className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-500 hover:text-slate-700"
                    aria-label={
                      showAdminPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showAdminPassword
                      ? 'Hide'
                      : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={buttonClass}
              >
                {loading
                  ? 'Authenticating...'
                  : 'Login'}
              </button>
            </form>
          ) : (
            /* Student Login */
            <form
              onSubmit={handleStudentLogin}
              className="space-y-4"
            >
              <div>
                <label
                  className={labelClass}
                  htmlFor="username"
                >
                  Username
                </label>

                <input
                  id="username"
                  type="text"
                  placeholder="Enter Your UID"
                  className={inputClass}
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <label
                  className={labelClass}
                  htmlFor="student-password"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="student-password"
                    type={
                      showStudentPassword
                        ? 'text'
                        : 'password'
                    }
                    placeholder="Enter your Password"
                    className={`${inputClass} pr-11`}
                    value={studentPassword}
                    onChange={(e) =>
                      setStudentPassword(
                        e.target.value
                      )
                    }
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowStudentPassword(
                        (prev) => !prev
                      )
                    }
                    className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-500 hover:text-slate-700"
                    aria-label={
                      showStudentPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showStudentPassword
                      ? 'Hide'
                      : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={buttonClass}
              >
                {loading
                  ? 'Verifying...'
                  : 'Login'}
              </button>
            </form>
          )}

        </div>
      </div>
    </section>
  );
};

export default Login;
