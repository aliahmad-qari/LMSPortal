import React from 'react';
import { Settings, Database, Globe, Shield, Bell, Lock, Server } from 'lucide-react';

const SuperAdminSettings: React.FC<{ navigate: (r: string, p?: any) => void }> = ({ navigate }) => {
    const settings = [
        { id: 'general', label: 'General', desc: 'Platform name, logo, and basic configuration', icon: Settings, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'security', label: 'Security', desc: 'Authentication, session management, password policies', icon: Lock, color: 'text-rose-600', bg: 'bg-rose-50' },
        { id: 'notifications', label: 'Notifications', desc: 'Email notifications, alerts, and messaging settings', icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50' },
        { id: 'permissions', label: 'Permissions', desc: 'Role-based access control and permission management', icon: Shield, color: 'text-violet-600', bg: 'bg-violet-50' },
        { id: 'storage', label: 'Storage', desc: 'File upload limits, storage quotas and cleanup', icon: Database, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 'api', label: 'API & Integrations', desc: 'Third party integrations, API keys and webhooks', icon: Globe, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900">System Settings</h1>
                <p className="text-slate-500 mt-1">Configure platform-wide settings and preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {settings.map((s) => (
                    <div key={s.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group">
                        <div className="flex items-start gap-4">
                            <div className={`${s.bg} ${s.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}><s.icon className="w-7 h-7" /></div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-slate-900">{s.label}</h3>
                                <p className="text-sm text-slate-500 mt-1">{s.desc}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Server Info */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Server className="w-5 h-5 text-slate-500" /> Server Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-slate-50 rounded-2xl"><p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Environment</p><p className="text-lg font-bold text-slate-900">Development</p></div>
                    <div className="p-4 bg-slate-50 rounded-2xl"><p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Node Version</p><p className="text-lg font-bold text-slate-900">v18+</p></div>
                    <div className="p-4 bg-slate-50 rounded-2xl"><p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Database</p><p className="text-lg font-bold text-slate-900">MongoDB Atlas</p></div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminSettings;
