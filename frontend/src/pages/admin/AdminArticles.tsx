import React, { useState } from 'react';
import { useBlog } from '../../context/BlogContext';
import { Article } from '../../types';
import { Plus, Search, Edit3, Trash2, X, Eye } from 'lucide-react';

export const AdminArticles: React.FC = () => {
  const { articles, categories, addArticle, updateArticle, deleteArticle } = useBlog();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<Article, '_id' | 'views' | 'likes' | 'comments'>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Software Architecture',
    tags: ['Architecture', 'TypeScript'],
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
    author: {
      name: 'Senior Full-Stack Engineer',
      role: 'Systems Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
    },
    status: 'Published',
    publishedAt: new Date().toISOString(),
    readTime: '5 min read',
    featured: false
  });

  const [tagInput, setTagInput] = useState('');

  const openAdd = () => {
    setEditingId(null);
    setForm({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: categories[0]?.name || 'Software Architecture',
      tags: ['Engineering'],
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
      author: {
        name: 'Senior Full-Stack Engineer',
        role: 'Systems Architect',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
      },
      status: 'Published',
      publishedAt: new Date().toISOString(),
      readTime: '5 min read',
      featured: false
    });
    setTagInput('');
    setIsModalOpen(true);
  };

  const openEdit = (art: Article) => {
    setEditingId(art._id);
    setForm({
      title: art.title,
      slug: art.slug,
      excerpt: art.excerpt,
      content: art.content,
      category: art.category,
      tags: [...art.tags],
      coverImage: art.coverImage,
      author: { ...art.author },
      status: art.status,
      publishedAt: art.publishedAt,
      readTime: art.readTime,
      featured: !!art.featured
    });
    setTagInput('');
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    const slugified = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setForm({ ...form, title: val, slug: slugified });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    if (editingId) {
      updateArticle(editingId, form);
    } else {
      addArticle(form);
    }
    setIsModalOpen(false);
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (t: string) => {
    setForm({ ...form, tags: form.tags.filter(item => item !== t) });
  };

  const filtered = articles.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Article Publishing &amp; Authoring
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Write new articles, manage publishing states, adjust tags, and feature top reads.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Article</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3 text-xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by title, topic, or keyword..."
          className="w-full bg-transparent focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3 px-4">Title &amp; Excerpt</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Views / Likes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((art) => (
                <tr key={art._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <strong className="text-slate-900 font-bold block">{art.title}</strong>
                    <span className="text-[11px] text-slate-400 block line-clamp-1">{art.excerpt}</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{art.category}</td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => updateArticle(art._id, { status: art.status === 'Published' ? 'Draft' : 'Published' })}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        art.status === 'Published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {art.status}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{art.views} / {art.likes}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(art)}
                        className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-100"
                        title="Edit Article"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${art.title}"?`)) deleteArticle(art._id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                        title="Delete Article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? 'Edit Article' : 'Write New Article'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block font-bold mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold"
                  >
                    {categories.map(c => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Excerpt Summary</label>
                <textarea
                  rows={2}
                  required
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Article Content (Markdown Supported)</label>
                <textarea
                  rows={8}
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Use ### for headers and ``` for code snippets..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono text-xs"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block font-bold mb-1">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="New tag..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs"
                  />
                  <button type="button" onClick={addTag} className="px-3 py-1.5 bg-slate-200 font-semibold rounded-lg">
                    Add Tag
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {form.tags.map(t => (
                    <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                      <span>#{t}</span>
                      <button type="button" onClick={() => removeTag(t)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Cover Image URL</label>
                  <input
                    type="url"
                    value={form.coverImage}
                    onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Publishing State</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 text-white font-bold"
                >
                  Save Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
