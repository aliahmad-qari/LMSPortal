import React, { useEffect, useState } from 'react';
import { superAdminAPI } from '../../services/api';
import { ShieldAlert, Clock, User, FileText } from 'lucide-react';

const ActivityLogs = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchLogs();
    }, [page]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await superAdminAPI.getLogs({ page, limit: 20 });
            setLogs(res.data.logs);
            setTotalPages(res.data.pages);
        } catch (err) {
            console.error('Failed to fetch logs', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="w-8 h-8 text-rose-600" />
                    System Activity Logs
                </h1>
                <p className="text-slate-500 mt-1">Monitor all system actions and security events.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700">User</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Role</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Action</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Details</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading logs...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No logs found.</td></tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-slate-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{log.user?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-slate-500">{log.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                ${log.user?.role === 'SUPER_ADMIN' ? 'bg-rose-100 text-rose-800' :
                                                    log.user?.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' :
                                                        'bg-blue-100 text-blue-800'}`}>
                                                {log.user?.role || 'SYSTEM'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-700">{log.action}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                                            {JSON.stringify(log.details)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(log.createdAt).toLocaleString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActivityLogs;
