import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBlog } from '../context/BlogContext';
import { Clock, Eye, Heart, MessageSquare, ArrowLeft, Share2, CheckCircle2, Send, Tag } from 'lucide-react';
import { ArticleCard } from '../components/ArticleCard';

export const BlogDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { articles, likeArticle, addComment } = useBlog();

  const article = articles.find(a => a.slug === slug) || articles[0];

  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-500 mb-4">Article not found.</p>
        <Link to="/" className="text-xs font-bold text-sky-600">Back to Home</Link>
      </div>
    );
  }

  const related = articles.filter(a => a.category === article.category && a._id !== article._id).slice(0, 2);

  const handleLike = () => {
    likeArticle(article._id);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;

    addComment(article._id, {
      authorName: commentName.trim(),
      authorEmail: commentEmail.trim(),
      content: commentText.trim()
    });

    setCommentSuccess(true);
    setCommentName('');
    setCommentEmail('');
    setCommentText('');
    setTimeout(() => setCommentSuccess(false), 3000);
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumb & Meta */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <Link to="/" className="inline-flex items-center gap-1.5 hover:text-sky-600 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Articles</span>
        </Link>
        <span className="px-2.5 py-0.5 rounded-full font-bold bg-sky-50 text-sky-700">
          {article.category}
        </span>
      </div>

      {/* Header */}
      <header className="space-y-4">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
          {article.title}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          {article.excerpt}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
            <div>
              <strong className="text-xs font-bold text-slate-900 block">{article.author.name}</strong>
              <span className="text-[11px] text-slate-400 block">{article.author.role}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readTime}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{article.views} views</span>
            </span>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      <div className="rounded-3xl overflow-hidden aspect-[16/9] bg-slate-100 border border-slate-200 shadow-md">
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content Markdown Body */}
      <div className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed space-y-4 font-serif">
        {article.content.split('\n\n').map((para, idx) => {
          if (para.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-xl sm:text-2xl font-sans font-black text-slate-900 tracking-tight pt-4">
                {para.replace('### ', '')}
              </h3>
            );
          }
          if (para.startsWith('```')) {
            const codeContent = para.replace(/```[a-z]*\n?/g, '');
            return (
              <pre key={idx} className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto my-4">
                <code>{codeContent}</code>
              </pre>
            );
          }
          return <p key={idx}>{para}</p>;
        })}
      </div>

      {/* Tags & Action Bar */}
      <div className="pt-8 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Tag className="w-4 h-4 text-slate-400 mr-1" />
          {article.tags.map(t => (
            <span key={t} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
              #{t}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLike}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
          >
            <Heart className="w-4 h-4 fill-rose-600" />
            <span>{article.likes} Likes</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>{copiedLink ? 'Link Copied!' : 'Share Article'}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <section className="pt-10 border-t border-slate-200 space-y-8">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-sky-600" />
          <span>Reader Discussion ({article.comments.length})</span>
        </h3>

        {/* Post Comment Form */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 text-xs">
          <h4 className="font-bold text-slate-900 text-sm">Join the Conversation</h4>

          {commentSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Thank you! Your comment has been posted and will appear below.</span>
            </div>
          )}

          <form onSubmit={handleCommentSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  placeholder="e.g. Jordan Smith"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Your Email</label>
                <input
                  type="email"
                  value={commentEmail}
                  onChange={(e) => setCommentEmail(e.target.value)}
                  placeholder="e.g. jordan@tech.io"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Comment Thoughts *</label>
              <textarea
                rows={3}
                required
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your experience or ask an architecture question..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Comment</span>
            </button>
          </form>
        </div>

        {/* Existing Comments */}
        <div className="space-y-4">
          {article.comments.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No comments posted yet. Be the first to start the discussion!</p>
          ) : (
            article.comments.map((comm) => (
              <div key={comm._id} className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 font-bold">{comm.authorName}</strong>
                  <span className="text-slate-400 text-[11px]">{new Date(comm.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{comm.content}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related Reads */}
      {related.length > 0 && (
        <section className="pt-10 border-t border-slate-200 space-y-6">
          <h3 className="text-xl font-bold text-slate-900">Recommended Next Reads</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {related.map(r => (
              <ArticleCard key={r._id} article={r} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
};
