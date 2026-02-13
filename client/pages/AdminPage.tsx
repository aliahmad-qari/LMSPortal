
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, User } from '../types';
import { 
  Users, 
  UserPlus, 
  MoreHorizontal, 
  Search, 
  Filter, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle,
  BarChart3,
  Loader2,
  Trash2,
  UserCheck
} from 'lucide-react';

const MOCK_USERS: User[] = [
  { id: '1', name: 'Dr. Alan Smith', email: 'alan@uni.edu', role: UserRole.INSTRUCTOR, isActive: true, department: 'Computer Science' },
  { id: '2', name: 'John Doe', email: 'john@uni.edu', role: UserRole.STUDENT, isActive: true, department: 'Business' },
  { id: '3', name: 'Jane Williams', email: 'jane@uni.edu', role: UserRole.STUDENT, isActive: false, department: 'Arts' },
  { id: '4', name: 'Prof. Michael Chen', email: 'michael@uni.edu', role: UserRole.INSTRUCTOR, isActive: true, department: 'Data Science' },
  { id: '5', name: 'Sarah Admin', email: 'sarah@uni.edu', role: UserRole.ADMIN, isActive: true, department: 'Administration' },
];

const AdminPage: React.FC<{ navigate: (r: string) => void, currentView?: string }> = ({ navigate, currentView }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Logic to refresh or fetch specific subset of data based on currentView
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  }, [currentView]);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Sub-view filtering
    if (currentView === 'admin-manage') return matchesSearch && u.role === UserRole.ADMIN;
    if (currentView === 'admin-instructors') return matchesSearch && u.role === UserRole.INSTRUCTOR;
    if (currentView === 'admin-students') return matchesSearch && u.role === UserRole.STUDENT;
    
    return matchesSearch;
  });

  const toggleStatus = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'admin-manage': return 'Manage Administrators';
      case 'admin-users': return 'User Directory';
      case 'admin-instructors': return 'Manage Instructors';
      case 'admin-students': return 'Manage Students';
      default: return 'University Management';
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">{getViewTitle()}</h1>
          <p className="text-slate-500">Performing administrative actions for {currentView?.replace('admin-', '')}.</p>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={() => navigate('admin-analytics')} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 font-bold hover:bg-slate-50 transition-all text-sm">
             <BarChart3 className="w-4 h-4" /> Reports
           </button>
           <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 text-sm">
             <UserPlus className="w-4 h-4" /> Add New
           </button>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-900">List ({filteredUsers.length})</h2>
            {isRefreshing && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search catalog..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600">
                        {u.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`
                      px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase
                      ${u.role === UserRole.INSTRUCTOR ? 'bg-indigo-50 text-indigo-600' : ''}
                      ${u.role === UserRole.STUDENT ? 'bg-slate-100 text-slate-600' : ''}
                      ${u.role === UserRole.ADMIN ? 'bg-amber-50 text-amber-600' : ''}
                      ${u.role === UserRole.SUPER_ADMIN ? 'bg-rose-50 text-rose-600' : ''}
                    `}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{u.department}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      <span className="text-xs font-medium text-slate-600">{u.isActive ? 'Active' : 'Disabled'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => toggleStatus(u.id)}
                        className={`p-2 rounded-xl transition-all ${u.isActive ? 'text-rose-400 hover:bg-rose-50' : 'text-emerald-400 hover:bg-emerald-50'}`}
                        title={u.isActive ? 'Disable User' : 'Enable User'}
                      >
                        {u.isActive ? <XCircle className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                      </button>
                      <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400 font-medium">No results found for current view.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
