import React from 'react';
import { Link } from 'react-router-dom';
import { useBlog } from '../context/BlogContext';
import { ArticleCard } from '../components/ArticleCard';
import { Sparkles, ArrowRight, TrendingUp, BookOpen, Tag } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { articles, categories } = useBlog();

  const published = articles.filter(a => a.status === 'Published');
  const featuredArticle = published.find(a => a.featured) || published[0];
  const recentArticles = published.filter(a => a._id !== featuredArticle?._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Featured Headline Story */}
      {featuredArticle && (
        <section>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-600 mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Featured Editorial Story</span>
          </div>
          <ArticleCard article={featuredArticle} featuredLayout={true} />
        </section>
      )}

      {/* Category Pills Bar */}
      <section className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-4 overflow-x-auto">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Explore Topics:</span>
        <div className="flex items-center gap-2">
          {categories.map((c) => (
            <Link
              key={c._id}
              to={`/category/${c.slug}`}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-sky-50 hover:text-sky-600 text-slate-700 transition-colors shrink-0"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Main Grid: Articles + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Recent Articles */}
        <div className="lg:col-span-8 space-y-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Latest Engineering Dispatches
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Field-tested architecture solutions, TypeScript patterns, and production diagnostics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentArticles.map((art) => (
              <ArticleCard key={art._id} article={art} />
            ))}
          </div>
        </div>

        {/* Right Column: Trending & About Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Editor Note */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">About Codenest Journal</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              An engineering-led publication documenting practical architectural patterns, TypeScript migrations, and real-world system debugging lessons.
            </p>
            <div className="pt-2 border-t border-slate-100">
              <Link to="/contact" className="text-xs font-bold text-sky-600 hover:underline">
                Submit an article proposal →
              </Link>
            </div>
          </div>

          {/* Popular Reads */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              <span>Trending Reads</span>
            </h3>

            <div className="space-y-4 divide-y divide-slate-100">
              {published.slice(0, 3).map((art, idx) => (
                <div key={art._id} className="pt-3 first:pt-0">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">#{idx + 1} • {art.category}</span>
                  <Link to={`/blog/${art.slug}`}>
                    <h4 className="font-bold text-slate-900 text-xs hover:text-sky-600 transition-colors line-clamp-2">
                      {art.title}
                    </h4>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
