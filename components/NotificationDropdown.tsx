import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { commonAPI } from '../services/api';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchNotifications();

        // Poll for notifications every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await commonAPI.getNotifications();
            setNotifications(res.data);
            setUnreadCount(res.data.filter((n: any) => !n.isRead).length);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await commonAPI.markNotificationRead(id);
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark as read', err);
        }
    };

    const handleMarkAllRead = async () => {
        // Optimistic update
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);

        // Execute API calls
        unreadIds.forEach(id => commonAPI.markNotificationRead(id).catch(console.error));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'WARNING': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case 'ERROR': return <AlertCircle className="w-5 h-5 text-rose-500" />;
            case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            default: return <Info className="w-5 h-5 text-indigo-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors outline-none"
            >
                <Bell className={`w-5 h-5 ${isOpen ? 'text-indigo-600' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                            >
                                <Check className="w-3 h-3" /> Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[22rem] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-50" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {notifications.map(notification => (
                                    <div
                                        key={notification._id}
                                        className={`p-4 hover:bg-slate-50 transition-colors flex gap-3 ${!notification.isRead ? 'bg-indigo-50/30' : ''}`}
                                        onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                                    >
                                        <div className="mt-0.5 shrink-0">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm text-slate-900 ${!notification.isRead ? 'font-semibold' : ''}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-1.5 flex justify-between items-center">
                                                <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                                                {!notification.isRead && (
                                                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-center">
                        <button className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
                            View All History
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
