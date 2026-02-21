import React, { useState, useEffect } from 'react';
import { useAuth, UserRole } from '../../context/AuthContext';
import { usersAPI } from '../../services/api';
import { Search, Plus, X, Loader2, CheckCircle, XCircle, Users, Shield, Trash2, AlertTriangle } from 'lucide-react';

const AdminUsers: React.FC<{ navigate: (r: string, p?: any) => void }> = ({ navigate }) => {
    const { user: me } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'STUDENT', department: '' });
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => { load(); }, []);

    const load = async () => {
        setIsLoading(true);
        try { const res = await usersAPI.getAll({ search: search || undefined, role: roleFilter || undefined }); setUsers(res.data); }
        catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    };

    const toggleStatus = async (id: string) => {
        try { await usersAPI.toggleStatus(id); load(); }
        catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
    };

    const handleDelete = async (id: string) => {
        try {
            await usersAPI.delete(id);
            setShowDeleteConfirm(null);
            load();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault(); setFormLoading(true);
        try { await usersAPI.create(createForm); setShowCreate(false); setCreateForm({ name: '', email: '', password: '', role: 'STUDENT', department: '' }); load(); }
        catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
        finally { setFormLoading(false); }
    };

    const allowedRoles = [{ v: 'INSTRUCTOR', l: 'Instructor' }, { v: 'STUDENT', l: 'Student' }];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">User Management</h1>
                    <p className="text-slate-500 mt-1">Create and manage user accounts.</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-200"><Plus className="w-5 h-5" /> Create User</button>
            </div>

            {/* Search/Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} placeholder="Search by name or email..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none shadow-sm" />
                </div>
                <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); }} className="px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none shadow-sm">
                    <option value="">All Roles</option>
                    <option value="INSTRUCTOR">Instructors</option>
                    <option value="STUDENT">Students</option>
                </select>
                <button onClick={load} className="bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-sm">Search</button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-40"><Loader2 className="w-8 h-8 animate-spin text-amber-600" /></div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead><tr className="bg-slate-50"><th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th><th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th><th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th><th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th><th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th></tr></thead>
                            <tbody className="divide-y divide-slate-50">
                                {users.map((u: any) => (
                                    <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-600">{u.name?.[0]}</div>
                                                <div><p className="font-bold text-slate-900 text-sm">{u.name}</p><p className="text-xs text-slate-500">{u.email}</p></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${u.role === 'ADMIN' ? 'bg-amber-50 text-amber-600' :
                                                u.role === 'INSTRUCTOR' ? 'bg-violet-50 text-violet-600' :
                                                    'bg-indigo-50 text-indigo-600'
                                            }`}>{u.role === 'ADMIN' ? <Shield className="w-3 h-3" /> : null}{u.role.replace('_', ' ')}</span></td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{u.department || '—'}</td>
                                        <td className="px-6 py-4">{u.isActive ? <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold"><CheckCircle className="w-3.5 h-3.5" /> Active</span> : <span className="flex items-center gap-1 text-xs text-red-500 font-bold"><XCircle className="w-3.5 h-3.5" /> Disabled</span>}</td>
                                        <td className="px-6 py-4 text-right">
                                            {u.role !== 'ADMIN' && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => toggleStatus(u._id)} className={`text-xs font-bold px-4 py-1.5 rounded-lg transition-colors ${u.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>
                                                        {u.isActive ? 'Disable' : 'Enable'}
                                                    </button>
                                                    <button onClick={() => setShowDeleteConfirm(u._id)} className="text-xs font-bold px-4 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-1">
                                                        <Trash2 className="w-3 h-3" /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {users.length === 0 && <div className="p-12 text-center text-slate-500">No users found</div>}
                </div>
            )}

            {/* Create User Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold">Create User</h2><button onClick={() => setShowCreate(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5" /></button></div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label><input type="text" value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl" required /></div>
                            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Email</label><input type="email" value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl" required /></div>
                            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Password</label><input type="password" value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl" required /></div>
                            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Role</label><select value={createForm.role} onChange={e => setCreateForm({ ...createForm, role: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl">{allowedRoles.map(r => <option key={r.v} value={r.v}>{r.l}</option>)}</select></div>
                            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Department</label><input type="text" value={createForm.department} onChange={e => setCreateForm({ ...createForm, department: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl" placeholder="Computer Science" /></div>
                            <button type="submit" disabled={formLoading} className="w-full bg-amber-500 text-white py-3 rounded-xl font-bold hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2">{formLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</> : 'Create User'}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Delete User?</h2>
                            <p className="text-slate-500 mb-6">This action cannot be undone. The user and all related data will be permanently removed.</p>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                                <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
