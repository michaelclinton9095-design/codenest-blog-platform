import React from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../types';
import { Clock, Eye, Heart, MessageSquare } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  featuredLayout?: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, featuredLayout = false }) => {
  return (
    <article className={`flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-sky-500/30 transition-all duration-300 overflow-hidden group ${
      featuredLayout ? 'md:flex-row md:items-center' : ''
    }`}>
      {/* Cover image */}
      <div className={`relative overflow-hidden bg-slate-100 ${
        featuredLayout ? 'md:w-1/2 aspect-video md:aspect-auto md:h-full min-h-[260px]' : 'aspect-video'
      }`}>
        <Link to={`/blog/${article.slug}`}>
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-white/90 backdrop-blur text-sky-700 shadow-sm">
            {article.category}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className={`p-6 flex-1 flex flex-col justify-between ${featuredLayout ? 'md:w-1/2' : ''}`}>
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{article.readTime}</span>
            </span>
          </div>

          <Link to={`/blog/${article.slug}`}>
            <h3 className={`font-black text-slate-900 group-hover:text-sky-600 transition-colors leading-snug mb-2 ${
              featuredLayout ? 'text-2xl' : 'text-lg line-clamp-2'
            }`}>
              {article.title}
            </h3>
          </Link>

          <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {article.excerpt}
          </p>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-7 h-7 rounded-full object-cover border border-slate-200"
            />
            <span className="text-xs font-semibold text-slate-700">{article.author.name}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>{article.likes}</span>
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{article.comments.length}</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
