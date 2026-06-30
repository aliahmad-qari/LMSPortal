import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, User, Mail, Lock, Building, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RegisterPageProps {
    onSwitchToLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
    const { register, error, clearError } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [department, setDepartment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localError, setLocalError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password) {
            setLocalError('Please fill in all required fields');
            return;
        }
        if (password.length < 6) {
            setLocalError('Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }
        setIsSubmitting(true);
        setLocalError('');
        clearError();
        try {
            await register({ name, email, password, department });
        } catch (err: any) {
            setLocalError(err.message || 'Registration failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const displayError = localError || error;

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-slate-900 to-slate-800">
            {/* Left side: branding */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-700 to-indigo-900 p-12 text-white flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-16">
                        <div className="bg-indigo-300/20 p-3 rounded-lg">
                            <GraduationCap className="w-8 h-8" />
                        </div>
                        <span className="text-3xl font-bold tracking-tight">Saad LMS</span>
                    </div>
                    <h1 className="text-5xl font-extrabold mb-6 leading-tight">Transforming Education Through Technology</h1>
                    <p className="text-lg text-indigo-100 max-w-lg leading-relaxed">
                        Access a comprehensive learning management system designed to enhance educational excellence and foster student success.
                    </p>
                </div>
                <div className="space-y-4">
                    {['Comprehensive course management', 'Secure online assessment tools', 'Real-time collaboration features', 'Professional support system'].map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-indigo-200 flex-shrink-0" />
                            <span className="text-indigo-50">{feature}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right side: Register form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-8 bg-slate-50">
                <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-2xl border border-slate-200">
                    <div className="text-center mb-8">
                        <div className="md:hidden flex items-center justify-center gap-2 mb-4">
                            <GraduationCap className="w-8 h-8 text-indigo-600" />
                            <span className="text-xl font-bold text-slate-900">Saad LMS</span>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h2>
                        <p className="text-slate-600">Register to access your learning portal</p>
                    </div>

                    {displayError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">{displayError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
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
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Department</label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    placeholder="Computer Science"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
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

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50 mt-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                        <p className="text-slate-600 text-sm">
                            Already have an account?{' '}
                            <button onClick={onSwitchToLogin} className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
                                Sign In
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
