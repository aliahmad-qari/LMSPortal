import React, { useEffect, useState } from 'react';
import { adminFeaturesAPI } from '../../services/api';
import { Tag, Plus, Trash2 } from 'lucide-react';

const CategoryManagement = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await adminFeaturesAPI.getCategories();
            setCategories(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await adminFeaturesAPI.createCategory(newCategory);
            setCategories([...categories, res.data]);
            setNewCategory({ name: '', description: '' });
            alert('Category added!');
        } catch (err) {
            alert('Failed to add category');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this category?')) return;
        try {
            await adminFeaturesAPI.deleteCategory(id);
            setCategories(categories.filter(c => c._id !== id));
        } catch (err) {
            alert('Failed to delete category');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
            {/* List */}
            <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Tag className="w-7 h-7 text-indigo-600" />
                    Categories
                </h1>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <ul className="divide-y divide-slate-100">
                        {categories.map(cat => (
                            <li key={cat._id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                <div>
                                    <h3 className="font-bold text-slate-900">{cat.name}</h3>
                                    <p className="text-sm text-slate-500">{cat.description || 'No description'}</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(cat._id)}
                                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </li>
                        ))}
                        {categories.length === 0 && !loading && (
                            <li className="p-8 text-center text-slate-500">No categories found.</li>
                        )}
                    </ul>
                </div>
            </div>

            {/* Create Form */}
            <div className="w-full lg:w-96">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-indigo-600" />
                        Add New Category
                    </h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                            <input
                                type="text"
                                value={newCategory.name}
                                onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea
                                value={newCategory.description}
                                onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none h-24 resize-none"
                            />
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                            Create Category
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CategoryManagement;
