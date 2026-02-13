
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { GraduationCap, Mail, Lock, Loader2, Info } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate real backend connection delay
    await new Promise(r => setTimeout(r, 800));
    await login(email || 'demo@uni.edu', role);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      <div className="hidden md:flex md:w-1/2 bg-indigo-900 p-12 text-white flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <GraduationCap className="w-10 h-10 text-indigo-400" />
            <span className="text-2xl font-bold tracking-tight">SmartLMS</span>
          </div>
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">University Learning, Simplified.</h1>
          <p className="text-xl text-indigo-200 max-w-lg">A powerful, all-in-one ecosystem for students, faculty, and administrators to thrive.</p>
        </div>
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
          <h4 className="flex items-center gap-2 font-bold mb-3 text-indigo-300">
            <Info className="w-4 h-4" /> System Demo Accounts
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <p>Super Admin: <span className="text-indigo-200">superadmin@uni.edu</span></p>
            <p>Admin: <span className="text-indigo-200">admin@uni.edu</span></p>
            <p>Instructor: <span className="text-indigo-200">instructor@uni.edu</span></p>
            <p>Student: <span className="text-indigo-200">student@uni.edu</span></p>
          </div>
          <p className="mt-3 text-[10px] text-indigo-400 font-medium italic">Pass: password123</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Login</h2>
            <p className="text-slate-500">Access your university workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-2">
              {Object.values(UserRole).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${role === r ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 text-slate-400 hover:border-indigo-300'}`}
                >
                  {r.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="name@uni.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
