import React from 'react';
import { useBlog } from '../../context/BlogContext';
import { Link } from 'react-router-dom';
import { FileText, Eye, Heart, MessageSquare, Plus, ArrowUpRight } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { articles, subscribers } = useBlog();

  const published = articles.filter(a => a.status === 'Published').length;
  const drafts = articles.filter(a => a.status === 'Draft').length;
  const totalViews = articles.reduce((sum, a) => sum + a.views, 0);
  const totalComments = articles.reduce((sum, a) => sum + a.comments.length, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            CMS Executive Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Publishing analytics, audience engagement metrics, and article drafting pipeline.
          </p>
        </div>

        <Link
          to="/admin/articles"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Article</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Published Articles</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{published}</div>
          <div className="text-[11px] text-slate-400 mt-1">{drafts} Drafts pending</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Total Readership</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalViews.toLocaleString()}</div>
          <div className="text-[11px] text-purple-600 mt-1 font-semibold">Unique article views</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Comments Moderated</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalComments}</div>
          <div className="text-[11px] text-emerald-600 mt-1 font-semibold">Active discussions</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Newsletter Audience</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{subscribers.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Verified subscribers</div>
        </div>
      </div>

      {/* Recent Articles */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Articles in Journal</h2>
          <Link to="/admin/articles" className="text-xs font-bold text-sky-600 hover:underline">
            Manage All Articles
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {articles.map((art) => (
            <div key={art._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-xs text-slate-900">{art.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    art.status === 'Published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {art.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-1">{art.excerpt}</p>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0">
                <span>{art.views} views</span>
                <span>{art.likes} likes</span>
                <span className="text-slate-500 font-semibold">{art.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
