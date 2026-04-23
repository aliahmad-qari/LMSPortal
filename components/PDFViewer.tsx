import React, { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';

interface PDFViewerProps {
  url: string;
  title?: string;
  onClose?: () => void;
  isModal?: boolean;
}

/**
 * PDFViewer Component
 * 
 * A reusable component for displaying PDF documents in the browser.
 * Supports both modal and inline display modes.
 * 
 * Usage:
 * <PDFViewer url="https://example.com/document.pdf" title="Course Material" />
 * 
 * Props:
 * - url: PDF document URL (required)
 * - title: Document title for display (optional)
 * - onClose: Callback when modal is closed (optional)
 * - isModal: Display as modal overlay (default: false)
 */

const PDFViewer: React.FC<PDFViewerProps> = ({ url, title = 'PDF Document', onClose, isModal = false }) => {
    const [zoom, setZoom] = useState(100);
    const [loading, setLoading] = useState(true);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = url;
        link.download = title || 'document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const viewerContent = (
        <div className="flex flex-col h-full bg-slate-100">
            {/* Toolbar */}
            <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="font-bold text-slate-900">{title}</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleZoomOut}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Zoom Out"
                    >
                        <ZoomOut className="w-5 h-5 text-slate-600" />
                    </button>
                    <span className="text-sm font-medium text-slate-600 min-w-12 text-center">{zoom}%</span>
                    <button
                        onClick={handleZoomIn}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Zoom In"
                    >
                        <ZoomIn className="w-5 h-5 text-slate-600" />
                    </button>
                    <div className="w-px h-6 bg-slate-200 mx-2" />
                    <button
                        onClick={handleDownload}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Download PDF"
                    >
                        <Download className="w-5 h-5 text-slate-600" />
                    </button>
                    {isModal && onClose && (
                        <>
                            <div className="w-px h-6 bg-slate-200 mx-2" />
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                title="Close"
                            >
                                <X className="w-5 h-5 text-red-600" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* PDF Container */}
            <div className="flex-1 overflow-auto bg-slate-100 p-4">
                <div className="flex justify-center">
                    <iframe
                        src={`${url}#toolbar=1&navpanes=0&scrollbar=1`}
                        style={{
                            width: `${zoom}%`,
                            height: '100%',
                            minHeight: '600px',
                            border: 'none',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                        onLoad={() => setLoading(false)}
                        title={title}
                    />
                </div>
            </div>
        </div>
    );

    if (isModal) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full h-[90vh] max-w-4xl shadow-2xl overflow-hidden">
                    {viewerContent}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-200 bg-white">
            {viewerContent}
        </div>
    );
};

export default PDFViewer;

/**
 * USAGE EXAMPLES
 * 
 * 1. Inline PDF Viewer (in a page or component):
 * 
 *    <div className="h-screen">
 *      <PDFViewer 
 *        url="https://example.com/course-material.pdf"
 *        title="Course Material - Chapter 1"
 *      />
 *    </div>
 * 
 * 2. Modal PDF Viewer (popup):
 * 
 *    const [showPDF, setShowPDF] = useState(false);
 *    
 *    return (
 *      <>
 *        <button onClick={() => setShowPDF(true)}>View PDF</button>
 *        {showPDF && (
 *          <PDFViewer
 *            url="https://example.com/document.pdf"
 *            title="Document Title"
 *            isModal={true}
 *            onClose={() => setShowPDF(false)}
 *          />
 *        )}
 *      </>
 *    );
 * 
 * 3. In a lesson viewer component:
 * 
 *    const LessonViewer = ({ lesson }) => {
 *      if (lesson.type === 'pdf') {
 *        return <PDFViewer url={lesson.contentUrl} title={lesson.title} />;
 *      }
 *      // ... handle other types
 *    };
 */
