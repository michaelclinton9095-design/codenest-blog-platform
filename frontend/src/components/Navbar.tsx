import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Feather, Search, Menu, X, Shield, BookOpen, Compass } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/archive?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm group-hover:bg-sky-600 transition-colors">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight leading-none block">
                CODE<span className="text-sky-600">NEST</span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block">
                Engineering Journal
              </span>
            </div>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm mx-4 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search engineering articles, tags..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-100 border border-transparent focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-700">
            <Link to="/" className="hover:text-sky-600 transition-colors">Home</Link>
            <Link to="/archive" className="hover:text-sky-600 transition-colors">All Topics</Link>
            <Link to="/category/architecture" className="hover:text-sky-600 transition-colors">Architecture</Link>
            <Link to="/category/typescript-react" className="hover:text-sky-600 transition-colors">TypeScript</Link>
            <Link to="/category/database-engineering" className="hover:text-sky-600 transition-colors">Database</Link>
            <Link to="/category/devops-reliability" className="hover:text-sky-600 transition-colors">DevOps</Link>
            <Link to="/contact" className="hover:text-sky-600 transition-colors">Contact</Link>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
              title="Blog CMS Dashboard"
            >
              <Shield className="w-3.5 h-3.5 text-sky-600" />
              <span>CMS Admin</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200 space-y-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-100 border border-slate-200"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>
            <div className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-slate-100">Home</Link>
              <Link to="/archive" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-slate-100">All Articles</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-slate-100">Contact</Link>
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg bg-sky-50 text-sky-700 font-bold flex items-center gap-2">
                <Shield className="w-4 h-4" /> CMS Admin Suite
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
