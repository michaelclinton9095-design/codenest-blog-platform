import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { BlogProvider } from './context/BlogContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { BlogDetails } from './pages/BlogDetails';
import { CategoryPage } from './pages/CategoryPage';
import { ContactPage } from './pages/ContactPage';

// Admin CMS
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminArticles } from './pages/admin/AdminArticles';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminComments } from './pages/admin/AdminComments';
import { ScrollToTopOnNavigate, ScrollToTopButton } from './components/ScrollToTop';

const PublicLayout: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export function App() {
  return (
    <BlogProvider>
      <Router>
        <ScrollToTopOnNavigate />
        <ScrollToTopButton />
        <Routes>
          {/* Public Journal Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/archive" element={<CategoryPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/blog/:slug" element={<BlogDetails />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          {/* CMS Admin Studio */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="articles" element={<AdminArticles />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="comments" element={<AdminComments />} />
          </Route>
        </Routes>
      </Router>
    </BlogProvider>
  );
}

export default App;
