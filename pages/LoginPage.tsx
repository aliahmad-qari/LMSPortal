import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const { login, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError('Please enter email and password');
      return;
    }
    setIsSubmitting(true);
    setLocalError('');
    clearError();
    try {
      await login(email, password);
    } catch (err: any) {
      setLocalError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left side: branding */}
      <div className="hidden md:flex md:w-1/2 bg-indigo-600 p-12 text-white flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <GraduationCap className="w-10 h-10" />
            <span className="text-2xl font-bold">Smart University LMS</span>
          </div>
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">Elevating Education with Modern Tech.</h1>
          <p className="text-xl text-indigo-100 max-w-lg">
            Manage your courses, interact with instructors, and excel in your academic journey with our unified learning platform.
          </p>
        </div>
        <div className="bg-indigo-500/30 p-8 rounded-3xl backdrop-blur-md border border-indigo-400/20">
          <p className="italic text-lg">"The future of learning is here. Seamless, efficient, and interactive."</p>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-400 flex items-center justify-center font-bold">P</div>
            <div>
              <p className="font-bold">Prof. Sarah Mitchell</p>
              <p className="text-sm text-indigo-200">Head of Digital Learning</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl shadow-indigo-100 border border-slate-100">
          <div className="text-center mb-8">
            <div className="md:hidden flex items-center justify-center gap-2 mb-4">
              <GraduationCap className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold text-slate-900">SmartLMS</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500">Log in to your account to continue</p>
          </div>

          {displayError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{displayError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold text-slate-700">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
              New student?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-indigo-600 font-bold hover:underline"
              >
                Create an account
              </button>
            </p>
          </div>

          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 font-semibold mb-2">Demo Accounts:</p>
            <div className="grid grid-cols-2 gap-1 text-xs text-slate-600">
              <span>Super Admin:</span><span>admin@lms.com / admin123</span>
              <span>Admin:</span><span>demoadmin@lms.com / admin123</span>
              <span>Instructor:</span><span>instructor@lms.com / instructor123</span>
              <span>Student:</span><span>student@lms.com / student123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
