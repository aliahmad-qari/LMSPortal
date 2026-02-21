import React, { useEffect, useState } from 'react';
import { studentFeaturesAPI } from '../../services/api';
import { Award, Download, ShieldCheck } from 'lucide-react';
// import jsPDF from 'jspdf'; // Placeholder for future implementation

const MyCertificates = () => {
    const [certificates, setCertificates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            const res = await studentFeaturesAPI.getCertificates();
            setCertificates(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (cert: any) => {
        // Mock download functionality - in real app, backend would serve a PDF
        alert(`Downloading certificate for ${cert.course.title}...`);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <ShieldCheck className="w-7 h-7 text-emerald-600" />
                My Certificates
            </h1>

            {loading ? (
                <div className="text-center p-8 text-slate-500">Loading certificates...</div>
            ) : certificates.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
                    <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Certificates Yet</h3>
                    <p className="text-slate-500">Complete courses to earn certificates!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map(cert => (
                        <div key={cert._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group">
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />

                            <Award className="w-12 h-12 text-emerald-600 mb-4 relative z-10" />

                            <h3 className="text-lg font-bold text-slate-900 mb-1 relative z-10">{cert.course?.title}</h3>
                            <p className="text-sm text-slate-500 mb-4 relative z-10">Issued on {new Date(cert.issueDate).toLocaleDateString()}</p>

                            <div className="bg-slate-50 p-3 rounded-xl mb-4 relative z-10">
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Certificate ID</p>
                                <p className="font-mono text-slate-700 text-sm">{cert.certificateCode}</p>
                            </div>

                            <button
                                onClick={() => handleDownload(cert)}
                                className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 relative z-10"
                            >
                                <Download className="w-4 h-4" /> Download PDF
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyCertificates;
