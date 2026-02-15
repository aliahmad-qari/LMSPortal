import React, { useEffect, useState } from 'react';
import { adminFeaturesAPI } from '../../services/api';
import { MessageSquare, User, Send, CheckCircle } from 'lucide-react';

const SupportTickets = () => {
    const [tickets, setTickets] = useState<any[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [reply, setReply] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await adminFeaturesAPI.getTickets();
            setTickets(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await adminFeaturesAPI.replyTicket(selectedTicket._id, { message: reply, status: 'IN_PROGRESS' });
            // Update local state
            setTickets(tickets.map(t => t._id === selectedTicket._id ? res.data : t));
            setSelectedTicket(res.data);
            setReply('');
        } catch (err) {
            alert('Failed to send reply');
        }
    };

    const handleCloseTicket = async () => {
        try {
            const res = await adminFeaturesAPI.replyTicket(selectedTicket._id, { message: 'Ticket Closed', status: 'CLOSED' });
            setTickets(tickets.map(t => t._id === selectedTicket._id ? res.data : t));
            setSelectedTicket(res.data);
        } catch (err) {
            alert('Failed to close ticket');
        }
    }

    return (
        <div className="flex h-[calc(100vh-64px)] bg-slate-50">
            {/* Ticket List */}
            <div className="w-96 border-r border-slate-200 bg-white overflow-y-auto">
                <div className="p-4 border-b border-slate-100">
                    <h2 className="font-bold text-slate-900 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-indigo-600" />
                        Support Tickets
                    </h2>
                </div>
                <div className="divide-y divide-slate-100">
                    {tickets.map(ticket => (
                        <div
                            key={ticket._id}
                            onClick={() => setSelectedTicket(ticket)}
                            className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${selectedTicket?._id === ticket._id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-semibold text-slate-900">{ticket.student?.name}</h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${ticket.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' :
                                        ticket.status === 'CLOSED' ? 'bg-slate-100 text-slate-600' :
                                            'bg-amber-100 text-amber-700'
                                    }`}>
                                    {ticket.status}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-slate-700 truncate">{ticket.subject}</p>
                            <p className="text-xs text-slate-500 truncate">{ticket.message}</p>
                            <p className="text-[10px] text-slate-400 mt-2 text-right">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ticket Details */}
            <div className="flex-1 flex flex-col bg-slate-50">
                {selectedTicket ? (
                    <>
                        <div className="p-6 border-b border-slate-200 bg-white flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{selectedTicket.subject}</h2>
                                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                    <span className="font-medium text-indigo-600">{selectedTicket.student?.name}</span>
                                    <span>•</span>
                                    <span>{selectedTicket.student?.email}</span>
                                </div>
                            </div>
                            {selectedTicket.status !== 'CLOSED' && (
                                <button onClick={handleCloseTicket} className="text-sm border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-600">
                                    Close Ticket
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Original Message */}
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                    <User className="w-5 h-5 text-slate-500" />
                                </div>
                                <div>
                                    <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-200 max-w-2xl">
                                        <p className="text-slate-700">{selectedTicket.message}</p>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1 ml-2">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Replies */}
                            {selectedTicket.replies?.map((reply: any, idx: number) => (
                                <div key={idx} className={`flex gap-4 ${reply.sender === selectedTicket.student._id ? '' : 'flex-row-reverse'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${reply.sender === selectedTicket.student._id ? 'bg-slate-200' : 'bg-indigo-100'}`}>
                                        <User className={`w-5 h-5 ${reply.sender === selectedTicket.student._id ? 'text-slate-500' : 'text-indigo-600'}`} />
                                    </div>
                                    <div className="max-w-2xl">
                                        <div className={`p-4 rounded-2xl shadow-sm border ${reply.sender === selectedTicket.student._id
                                                ? 'bg-white rounded-tl-none border-slate-200'
                                                : 'bg-indigo-600 text-white rounded-tr-none border-indigo-600'
                                            }`}>
                                            <p>{reply.message}</p>
                                        </div>
                                        <p className={`text-xs text-slate-400 mt-1 ${reply.sender === selectedTicket.student._id ? 'ml-2' : 'text-right mr-2'}`}>
                                            {new Date(reply.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reply Input */}
                        {selectedTicket.status !== 'CLOSED' ? (
                            <div className="p-4 bg-white border-t border-slate-200">
                                <form onSubmit={handleReply} className="flex gap-4">
                                    <input
                                        type="text"
                                        value={reply}
                                        onChange={e => setReply(e.target.value)}
                                        placeholder="Type your reply..."
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-indigo-500"
                                        required
                                    />
                                    <button type="submit" className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-colors">
                                        <Send className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-slate-500 text-sm">
                                This ticket is closed.
                            </div>
                        )}
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                        <p>Select a ticket to view conversation</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportTickets;
