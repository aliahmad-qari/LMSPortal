
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
// Import User interface from types
import { User } from '../types';
// Remove User from lucide-react import list as it collides with the User interface and is already aliased to UserIcon
import { Camera, Save, User as UserIcon, Mail, Building, CheckCircle } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState<Partial<User>>({
    name: user?.name || '',
    avatar: user?.avatar || '',
    department: user?.department || ''
  });
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Personal Account</h1>
        <p className="text-slate-500">Update your university profile and personal settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
            <div className="relative inline-block mb-4">
              <img 
                src={formData.avatar} 
                className="w-32 h-32 rounded-full object-cover border-4 border-slate-50 shadow-inner mx-auto"
                alt="Profile"
              />
              <button className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-xl font-bold text-slate-900">{user?.name}</h3>
            <p className="text-sm text-slate-500 uppercase tracking-widest font-bold mt-1">{user?.role.replace('_', ' ')}</p>
            <p className="text-xs text-indigo-600 font-medium mt-2">{user?.email}</p>
          </div>
          
          <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
            <h4 className="text-sm font-bold text-indigo-900 mb-2">Account Status</h4>
            <div className="flex items-center gap-2 text-emerald-600 mb-4">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-bold">Verified Account</span>
            </div>
            <p className="text-[10px] text-indigo-700 leading-relaxed font-medium">Your account is fully synchronized with the University Central Directory System.</p>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Profile Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Department</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={formData.department}
                      onChange={e => setFormData({ ...formData, department: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email (Primary)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    value={user?.email} 
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Avatar URL (External Resource)</label>
                <input 
                  type="text" 
                  value={formData.avatar}
                  onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://example.com/image.png"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-xs font-mono"
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <p className={`text-sm font-medium text-emerald-600 transition-opacity duration-500 ${isSaved ? 'opacity-100' : 'opacity-0'}`}>
                  Profile updated successfully!
                </p>
                <button 
                  type="submit"
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
                >
                  <Save className="w-5 h-5" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
