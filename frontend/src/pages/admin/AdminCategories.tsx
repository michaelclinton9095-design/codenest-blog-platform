import React from 'react';
import { useBlog } from '../../context/BlogContext';
import { FolderTree } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const { categories, articles } = useBlog();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Categories &amp; Topic Hubs
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review topics, description summaries, and article association counts.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((c) => {
          const count = articles.filter(a => a.category === c.name).length;
          return (
            <div key={c._id} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
              <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 w-fit">
                <FolderTree className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                <span className="text-[11px] font-mono text-slate-400">/{c.slug}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{c.description}</p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>Articles</span>
                <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-bold">
                  {count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
