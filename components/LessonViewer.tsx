import React, { useState } from 'react';
import VideoPlayer from './VideoPlayer';
import PDFViewer from './PDFViewer';
import { FileText, Video, Type } from 'lucide-react';

interface Lesson {
  _id?: string;
  title: string;
  type: 'video' | 'pdf' | 'text';
  contentUrl: string;
  description?: string;
  duration?: string;
}

interface LessonViewerProps {
  lesson: Lesson;
  onClose?: () => void;
}

/**
 * LessonViewer Component
 * 
 * Unified component for displaying different lesson types:
 * - Video: Uses VideoPlayer component
 * - PDF: Uses PDFViewer component
 * - Text: Displays as formatted text content
 * 
 * Usage:
 * <LessonViewer lesson={lesson} />
 */

const LessonViewer: React.FC<LessonViewerProps> = ({ lesson, onClose }) => {
    const [showPDF, setShowPDF] = useState(false);

    const renderContent = () => {
        switch (lesson.type) {
            case 'video':
                return (
                    <div className="space-y-4">
                        <VideoPlayer
                            url={lesson.contentUrl}
                            title={lesson.title}
                            onDownload={() => window.open(lesson.contentUrl, '_blank')}
                        />
                        {lesson.description && (
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <h3 className="font-bold text-slate-900 mb-2">Description</h3>
                                <p className="text-slate-700 text-sm leading-relaxed">{lesson.description}</p>
                            </div>
                        )}
                    </div>
                );

            case 'pdf':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-3">
                                <FileText className="w-8 h-8 text-red-600" />
                                <div>
                                    <h3 className="font-bold text-slate-900">{lesson.title}</h3>
                                    {lesson.duration && (
                                        <p className="text-sm text-slate-600">Duration: {lesson.duration}</p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPDF(true)}
                                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-medium text-sm"
                            >
                                View PDF
                            </button>
                        </div>
                        {lesson.description && (
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <h3 className="font-bold text-slate-900 mb-2">Description</h3>
                                <p className="text-slate-700 text-sm leading-relaxed">{lesson.description}</p>
                            </div>
                        )}
                        {showPDF && (
                            <PDFViewer
                                url={lesson.contentUrl}
                                title={lesson.title}
                                isModal={true}
                                onClose={() => setShowPDF(false)}
                            />
                        )}
                    </div>
                );

            case 'text':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <Type className="w-8 h-8 text-blue-600" />
                            <div>
                                <h3 className="font-bold text-slate-900">{lesson.title}</h3>
                                {lesson.duration && (
                                    <p className="text-sm text-slate-600">Duration: {lesson.duration}</p>
                                )}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg border border-slate-200 prose prose-sm max-w-none">
                            <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                                {lesson.contentUrl}
                            </div>
                        </div>
                        {lesson.description && (
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <h3 className="font-bold text-slate-900 mb-2">Additional Notes</h3>
                                <p className="text-slate-700 text-sm leading-relaxed">{lesson.description}</p>
                            </div>
                        )}
                    </div>
                );

            default:
                return (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        <p className="font-bold">Unknown lesson type: {lesson.type}</p>
                    </div>
                );
        }
    };

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        {lesson.type === 'video' && <Video className="w-5 h-5 text-blue-600" />}
                        {lesson.type === 'pdf' && <FileText className="w-5 h-5 text-red-600" />}
                        {lesson.type === 'text' && <Type className="w-5 h-5 text-green-600" />}
                        <span className="text-xs font-bold text-slate-600 uppercase">{lesson.type}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">{lesson.title}</h1>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-700 text-2xl"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default LessonViewer;

/**
 * USAGE EXAMPLES
 * 
 * 1. Display a video lesson:
 * 
 *    <LessonViewer 
 *      lesson={{
 *        title: "Introduction to React",
 *        type: "video",
 *        contentUrl: "https://cloudinary.com/video.mp4",
 *        description: "Learn the basics of React"
 *      }}
 *    />
 * 
 * 2. Display a PDF lesson:
 * 
 *    <LessonViewer 
 *      lesson={{
 *        title: "React Documentation",
 *        type: "pdf",
 *        contentUrl: "https://cloudinary.com/docs.pdf",
 *        duration: "20 mins"
 *      }}
 *    />
 * 
 * 3. Display a text lesson:
 * 
 *    <LessonViewer 
 *      lesson={{
 *        title: "React Concepts",
 *        type: "text",
 *        contentUrl: "React is a JavaScript library...",
 *        description: "Key concepts to understand"
 *      }}
 *    />
 * 
 * 4. In a course view with close handler:
 * 
 *    const [selectedLesson, setSelectedLesson] = useState(null);
 *    
 *    return (
 *      <>
 *        {selectedLesson && (
 *          <LessonViewer 
 *            lesson={selectedLesson}
 *            onClose={() => setSelectedLesson(null)}
 *          />
 *        )}
 *      </>
 *    );
 */
