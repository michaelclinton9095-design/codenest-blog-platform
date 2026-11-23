import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useBlog } from '../context/BlogContext';
import { ArticleCard } from '../components/ArticleCard';
import { Search, Tag } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const { articles, categories } = useBlog();

  const searchQueryParam = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(searchQueryParam);

  const currentCategory = categories.find(c => c.slug === slug);

  const filtered = useMemo(() => {
    return articles.filter(a => {
      let matchCat = true;
      if (slug) {
        if (currentCategory) {
          matchCat = a.category.toLowerCase() === currentCategory.name.toLowerCase();
        } else {
          const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
          const cleanCat = a.category.toLowerCase().replace(/[^a-z0-9]/g, '');
          matchCat = cleanCat.includes(cleanSlug) || cleanSlug.includes(cleanCat);
        }
      }
      const matchSearch = searchTerm
        ? a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
        : true;
      return matchCat && matchSearch && a.status === 'Published';
    });
  }, [articles, slug, currentCategory, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          {currentCategory ? currentCategory.name : 'All Articles & Engineering Archives'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {currentCategory ? currentCategory.description : 'Browse all published engineering dispatches and system design patterns.'}
        </p>
      </div>

      {/* Topic Switcher Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Link
          to="/archive"
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
            !slug ? 'bg-sky-600 text-white shadow-sm' : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
          }`}
        >
          All Topics ({articles.filter(a => a.status === 'Published').length})
        </Link>
        {categories.map((c) => {
          const isActive = slug === c.slug;
          const count = articles.filter(a => a.category === c.name && a.status === 'Published').length;
          return (
            <Link
              key={c._id}
              to={`/category/${c.slug}`}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5 ${
                isActive ? 'bg-sky-600 text-white shadow-sm' : 'bg-white border border-slate-200 hover:bg-sky-50 hover:text-sky-600 text-slate-700'
              }`}
            >
              <span>{c.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3 max-w-md">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter articles by keyword or tag..."
          className="w-full text-xs bg-transparent focus:outline-none"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-white border border-slate-200 text-xs text-slate-400">
          No published articles matched your search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(art => (
            <ArticleCard key={art._id} article={art} />
          ))}
        </div>
      )}
    </div>
  );
};
