import React, { useEffect, useState } from 'react';
import { studentFeaturesAPI } from '../../services/api';
import { MessageSquare, Plus, Ticket as TicketIcon } from 'lucide-react';

const StudentSupport = () => {
    const [tickets, setTickets] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [newTicket, setNewTicket] = useState({ subject: '', message: '' });

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await studentFeaturesAPI.getMyTickets();
            setTickets(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await studentFeaturesAPI.createTicket(newTicket);
            setTickets([res.data, ...tickets]);
            setShowForm(false);
            setNewTicket({ subject: '', message: '' });
            alert('Ticket created!');
        } catch (err) {
            alert('Failed to create ticket');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Ticket Form */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-indigo-600" />
                        New Support Ticket
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                            <input
                                type="text"
                                value={newTicket.subject}
                                onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                            <textarea
                                value={newTicket.message}
                                onChange={e => setNewTicket({ ...newTicket, message: e.target.value })}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none h-32 resize-none"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                            Submit Ticket
                        </button>
                    </form>
                </div>
            </div>

            {/* Ticket List */}
            <div className="lg:col-span-2">
                <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <TicketIcon className="w-7 h-7 text-indigo-600" />
                    My Support Tickets
                </h1>

                <div className="space-y-4">
                    {tickets.length === 0 ? (
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
                            No tickets created yet.
                        </div>
                    ) : (
                        tickets.map(ticket => (
                            <div key={ticket._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-indigo-200 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-slate-900">{ticket.subject}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${ticket.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' :
                                            ticket.status === 'CLOSED' ? 'bg-slate-100 text-slate-600' :
                                                'bg-amber-100 text-amber-700'
                                        }`}>
                                        {ticket.status}
                                    </span>
                                </div>
                                <p className="text-slate-600 mb-3 line-clamp-2">{ticket.message}</p>

                                {ticket.replies?.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <p className="text-xs font-bold text-slate-500 mb-2">Latest Reply:</p>
                                        <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                                            {ticket.replies[ticket.replies.length - 1].message}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentSupport;
