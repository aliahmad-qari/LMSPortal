import React, { useState } from 'react';
import { coursesAPI, uploadAPI } from '../../services/api';
import { X, Loader2, ChevronLeft, BookOpen, Upload, Plus, Trash2, ChevronDown, ChevronUp, FileVideo, FileText } from 'lucide-react';

interface Lesson {
  id?: string;
  title: string;
  type: 'video' | 'pdf' | 'text';
  contentUrl: string;
  description: string;
  duration: string;
  uploading?: boolean;
  uploadProgress?: number;
}

interface Section {
  id?: string;
  sectionTitle: string;
  description: string;
  lessons: Lesson[];
  expanded?: boolean;
}

const InstructorCreateCourse: React.FC<{ navigate: (r: string, p?: any) => void }> = ({ navigate }) => {
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'General',
        price: 0,
        level: 'Beginner',
        duration: ''
    });
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [sections, setSections] = useState<Section[]>([]);
    const [creating, setCreating] = useState(false);
    const [showBuilder, setShowBuilder] = useState(false);

    const handleAddSection = () => {
        setSections([...sections, {
            sectionTitle: '',
            description: '',
            lessons: [],
            expanded: true
        }]);
    };

    const handleUpdateSection = (index: number, field: string, value: any) => {
        const updated = [...sections];
        updated[index] = { ...updated[index], [field]: value };
        setSections(updated);
    };

    const handleDeleteSection = (index: number) => {
        setSections(sections.filter((_, i) => i !== index));
    };

    const handleAddLesson = (sectionIndex: number) => {
        const updated = [...sections];
        updated[sectionIndex].lessons.push({
            title: '',
            type: 'video',
            contentUrl: '',
            description: '',
            duration: ''
        });
        setSections(updated);
    };

    const handleUpdateLesson = (sectionIndex: number, lessonIndex: number, field: string, value: any) => {
        const updated = [...sections];
        updated[sectionIndex].lessons[lessonIndex] = {
            ...updated[sectionIndex].lessons[lessonIndex],
            [field]: value
        };
        setSections(updated);
    };

    const handleDeleteLesson = (sectionIndex: number, lessonIndex: number) => {
        const updated = [...sections];
        updated[sectionIndex].lessons = updated[sectionIndex].lessons.filter((_, i) => i !== lessonIndex);
        setSections(updated);
    };

    const toggleSectionExpand = (index: number) => {
        const updated = [...sections];
        updated[index].expanded = !updated[index].expanded;
        setSections(updated);
    };

    const handleFileUpload = async (sectionIndex: number, lessonIndex: number, file: File) => {
        const lesson = sections[sectionIndex].lessons[lessonIndex];
        
        // Update uploading state
        const updated = [...sections];
        updated[sectionIndex].lessons[lessonIndex].uploading = true;
        setSections(updated);

        try {
            let response;
            
            if (lesson.type === 'video') {
                response = await uploadAPI.uploadVideo(file);
            } else if (lesson.type === 'pdf') {
                response = await uploadAPI.uploadPDF(file);
            } else {
                throw new Error('Invalid file type');
            }

            // Update lesson with uploaded URL
            const updatedSections = [...sections];
            updatedSections[sectionIndex].lessons[lessonIndex].contentUrl = response.data.data.url;
            updatedSections[sectionIndex].lessons[lessonIndex].uploading = false;
            setSections(updatedSections);

            alert(`${lesson.type === 'video' ? 'Video' : 'PDF'} uploaded successfully!`);
        } catch (err: any) {
            alert(err.response?.data?.message || `Failed to upload ${lesson.type}`);
            const updatedSections = [...sections];
            updatedSections[sectionIndex].lessons[lessonIndex].uploading = false;
            setSections(updatedSections);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            const fd = new FormData();
            fd.append('title', form.title);
            fd.append('description', form.description);
            fd.append('category', form.category);
            fd.append('price', form.price.toString());
            fd.append('level', form.level);
            fd.append('duration', form.duration);
            
            // Filter out empty sections and lessons before sending
            if (sections.length > 0) {
                const validSections = sections
                    .filter(s => s.sectionTitle && s.sectionTitle.trim())
                    .map(s => ({
                        ...s,
                        lessons: s.lessons.filter(l => l.title && l.title.trim() && l.contentUrl && l.contentUrl.trim())
                    }));
                
                if (validSections.length > 0) {
                    fd.append('sections', JSON.stringify(validSections));
                }
            }
            
            if (thumbnail) fd.append('thumbnail', thumbnail);
            
            await coursesAPI.create(fd);
            navigate('my-courses');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to create course');
        }
        finally {
            setCreating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-8">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('dashboard')} className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Create New Course</h1>
                    <p className="text-sm text-slate-500">Build a structured course with sections and lessons.</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Course Information */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-slate-900">Course Information</h2>
                        
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Course Title</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                placeholder="e.g. Advanced React Architecture"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-lg"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                placeholder="What will students learn in this course?"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none h-32"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                                <select
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                                >
                                    {['General', 'Computer Science', 'Business', 'Arts', 'Data Science', 'Engineering', 'Mathematics'].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Level</label>
                                <select
                                    value={form.level}
                                    onChange={e => setForm({ ...form, level: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Price ($)</label>
                                <input
                                    type="number"
                                    value={form.price}
                                    onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                                    placeholder="0"
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Duration</label>
                                <input
                                    type="text"
                                    value={form.duration}
                                    onChange={e => setForm({ ...form, duration: e.target.value })}
                                    placeholder="e.g. 4 weeks, 20 hours"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Course Thumbnail */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Course Thumbnail</label>
                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-violet-300 transition-colors">
                            {thumbnail ? (
                                <div className="flex items-center justify-center gap-3">
                                    <BookOpen className="w-8 h-8 text-violet-500" />
                                    <span className="font-medium text-slate-700">{thumbnail.name}</span>
                                    <button type="button" onClick={() => setThumbnail(null)} className="text-red-400 hover:text-red-600">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="cursor-pointer">
                                    <Upload className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                    <p className="text-sm text-slate-500">Click to upload image</p>
                                    <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB</p>
                                    <input type="file" accept="image/*" onChange={e => setThumbnail(e.target.files?.[0] || null)} className="hidden" />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Course Builder Toggle */}
                    <div className="border-t border-slate-200 pt-6">
                        <button
                            type="button"
                            onClick={() => setShowBuilder(!showBuilder)}
                            className="flex items-center gap-2 text-violet-600 font-bold hover:text-violet-700"
                        >
                            {showBuilder ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            {showBuilder ? 'Hide' : 'Show'} Course Structure Builder
                        </button>
                    </div>

                    {/* Course Builder */}
                    {showBuilder && (
                        <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-900">Course Structure</h3>
                                <button
                                    type="button"
                                    onClick={handleAddSection}
                                    className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 font-medium"
                                >
                                    <Plus className="w-4 h-4" /> Add Section
                                </button>
                            </div>

                            {sections.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">No sections yet. Click "Add Section" to get started.</p>
                            ) : (
                                <div className="space-y-4">
                                    {sections.map((section, sectionIndex) => (
                                        <div key={sectionIndex} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                            {/* Section Header */}
                                            <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200">
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={section.sectionTitle}
                                                        onChange={e => handleUpdateSection(sectionIndex, 'sectionTitle', e.target.value)}
                                                        placeholder="Section title"
                                                        className="w-full font-bold text-slate-900 bg-transparent outline-none"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleSectionExpand(sectionIndex)}
                                                        className="p-2 hover:bg-slate-200 rounded-lg"
                                                    >
                                                        {section.expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteSection(sectionIndex)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Section Content */}
                                            {section.expanded && (
                                                <div className="p-4 space-y-4">
                                                    <input
                                                        type="text"
                                                        value={section.description}
                                                        onChange={e => handleUpdateSection(sectionIndex, 'description', e.target.value)}
                                                        placeholder="Section description (optional)"
                                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500"
                                                    />

                                                    {/* Lessons */}
                                                    <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-bold text-slate-900">Lessons ({section.lessons.length})</h4>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAddLesson(sectionIndex)}
                                                                className="flex items-center gap-1 text-violet-600 hover:text-violet-700 font-medium text-sm"
                                                            >
                                                                <Plus className="w-4 h-4" /> Add Lesson
                                                            </button>
                                                        </div>

                                                        {section.lessons.length === 0 ? (
                                                            <p className="text-slate-500 text-sm">No lessons yet.</p>
                                                        ) : (
                                                            <div className="space-y-3">
                                                                {section.lessons.map((lesson, lessonIndex) => (
                                                                    <div key={lessonIndex} className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
                                                                        <div className="flex items-start justify-between gap-3">
                                                                            <input
                                                                                type="text"
                                                                                value={lesson.title}
                                                                                onChange={e => handleUpdateLesson(sectionIndex, lessonIndex, 'title', e.target.value)}
                                                                                placeholder="Lesson title"
                                                                                className="flex-1 font-bold text-slate-900 bg-transparent outline-none"
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleDeleteLesson(sectionIndex, lessonIndex)}
                                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </div>

                                                                        <div className="grid grid-cols-2 gap-3">
                                                                            <div>
                                                                                <label className="text-xs font-bold text-slate-700 mb-1 block">Type</label>
                                                                                <select
                                                                                    value={lesson.type}
                                                                                    onChange={e => handleUpdateLesson(sectionIndex, lessonIndex, 'type', e.target.value)}
                                                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500"
                                                                                >
                                                                                    <option value="video">Video</option>
                                                                                    <option value="pdf">PDF</option>
                                                                                    <option value="text">Text</option>
                                                                                </select>
                                                                            </div>

                                                                            <div>
                                                                                <label className="text-xs font-bold text-slate-700 mb-1 block">Duration</label>
                                                                                <input
                                                                                    type="text"
                                                                                    value={lesson.duration}
                                                                                    onChange={e => handleUpdateLesson(sectionIndex, lessonIndex, 'duration', e.target.value)}
                                                                                    placeholder="e.g. 15 mins"
                                                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500"
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        <div>
                                                                            <label className="text-xs font-bold text-slate-700 mb-1 block">Content URL</label>
                                                                            <div className="space-y-2">
                                                                                {lesson.type !== 'text' && (
                                                                                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-3 text-center hover:border-violet-400 transition-colors">
                                                                                        {lesson.uploading ? (
                                                                                            <div className="flex items-center justify-center gap-2">
                                                                                                <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                                                                                                <span className="text-sm text-slate-600">Uploading...</span>
                                                                                            </div>
                                                                                        ) : lesson.contentUrl ? (
                                                                                            <div className="flex items-center justify-center gap-2">
                                                                                                {lesson.type === 'video' ? (
                                                                                                    <FileVideo className="w-4 h-4 text-green-600" />
                                                                                                ) : (
                                                                                                    <FileText className="w-4 h-4 text-red-600" />
                                                                                                )}
                                                                                                <span className="text-sm text-green-600 font-medium">File uploaded ✓</span>
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() => handleUpdateLesson(sectionIndex, lessonIndex, 'contentUrl', '')}
                                                                                                    className="text-xs text-red-500 hover:text-red-700"
                                                                                                >
                                                                                                    Change
                                                                                                </button>
                                                                                            </div>
                                                                                        ) : (
                                                                                            <label className="cursor-pointer">
                                                                                                <Upload className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                                                                                                <p className="text-xs text-slate-600">Click to upload {lesson.type}</p>
                                                                                                <input
                                                                                                    type="file"
                                                                                                    accept={lesson.type === 'video' ? 'video/*' : 'application/pdf'}
                                                                                                    onChange={e => {
                                                                                                        const file = e.target.files?.[0];
                                                                                                        if (file) {
                                                                                                            handleFileUpload(sectionIndex, lessonIndex, file);
                                                                                                        }
                                                                                                    }}
                                                                                                    className="hidden"
                                                                                                />
                                                                                            </label>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                                {lesson.type === 'text' && (
                                                                                    <input
                                                                                        type="url"
                                                                                        value={lesson.contentUrl}
                                                                                        onChange={e => handleUpdateLesson(sectionIndex, lessonIndex, 'contentUrl', e.target.value)}
                                                                                        placeholder="https://example.com/content"
                                                                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500"
                                                                                    />
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        <div>
                                                                            <label className="text-xs font-bold text-slate-700 mb-1 block">Description (optional)</label>
                                                                            <textarea
                                                                                value={lesson.description}
                                                                                onChange={e => handleUpdateLesson(sectionIndex, lessonIndex, 'description', e.target.value)}
                                                                                placeholder="Lesson description"
                                                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500 h-20"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={creating}
                        className="w-full bg-violet-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-violet-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-200 disabled:opacity-50"
                    >
                        {creating ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</> : '🚀 Create Course'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default InstructorCreateCourse;
