import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Feather, Mail, CheckCircle2, Shield, Heart } from 'lucide-react';
import { useBlog } from '../context/BlogContext';

export const Footer: React.FC = () => {
  const { categories, subscribeNewsletter } = useBlog();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      subscribeNewsletter(email.trim());
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
          {/* Brand */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
                <Feather className="w-4 h-4" />
              </div>
              <span className="font-black text-white text-lg tracking-tight">
                CODE<span className="text-sky-400">NEST</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Engineering insights, systems architecture, TypeScript best practices, and deep-dive troubleshooting workflows for modern developers.
            </p>
          </div>

          {/* Topics */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Categories</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {categories.map((c) => (
                <li key={c._id}>
                  <Link to={`/category/${c.slug}`} className="hover:text-sky-400 transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Subscribe to Newsletter</h4>
            <p className="text-xs text-slate-400">
              Receive concise technical case studies and architectural breakdowns in your inbox.
            </p>

            {subscribed ? (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Subscribed! Check your inbox for updates.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@company.com"
                  className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} Codenest Blog Platform. Built with modern React 19, TypeScript, and Tailwind CSS.</p>
          <div className="flex items-center gap-4">
            <Link to="/contact" className="hover:text-slate-400">Contact</Link>
            <Link to="/admin" className="hover:text-sky-400 inline-flex items-center gap-1">
              <Shield className="w-3 h-3" /> CMS Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
