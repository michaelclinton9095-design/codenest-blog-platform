import React from 'react';
import { useBlog } from '../../context/BlogContext';
import { MessageSquare, Check, Trash2, AlertOctagon } from 'lucide-react';

export const AdminComments: React.FC = () => {
  const { articles, updateCommentStatus, deleteComment } = useBlog();

  // Aggregate all comments across articles
  const allComments = articles.flatMap(art =>
    art.comments.map(c => ({ ...c, articleTitle: art.title, articleId: art._id }))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Comment Moderation Center
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Approve, flag spam, or remove reader comments submitted on engineering articles.
        </p>
      </div>

      {allComments.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-white border border-slate-200 text-xs text-slate-400">
          No reader comments have been submitted yet.
        </div>
      ) : (
        <div className="space-y-3">
          {allComments.map((comm) => (
            <div key={comm._id} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <strong className="text-slate-900 font-bold">{comm.authorName}</strong>
                  <span className="text-slate-400 text-[11px]">({comm.authorEmail})</span>
                  <span className="text-slate-400">• on article "{comm.articleTitle}"</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">{comm.content}</p>
                <span className="text-[10px] text-slate-400 block">{new Date(comm.createdAt).toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => updateCommentStatus(comm.articleId, comm._id, 'Approved')}
                  className="px-2.5 py-1 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateCommentStatus(comm.articleId, comm._id, 'Spam')}
                  className="px-2.5 py-1 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 font-semibold"
                >
                  Spam
                </button>
                <button
                  onClick={() => deleteComment(comm.articleId, comm._id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                  title="Delete Comment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
