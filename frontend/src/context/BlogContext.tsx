import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Article, Category, Comment } from '../types';
import { initialArticles, initialCategories } from '../data/blogData';

const API_BASE = 'http://localhost:5001/api';

export interface BlogStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalComments: number;
  totalViews: number;
  totalLikes: number;
}

export interface AdminCommentView {
  _id: string;
  articleId: string;
  articleTitle: string;
  authorName: string;
  authorEmail: string;
  content: string;
  status: 'Approved' | 'Pending' | 'Spam';
  createdAt: string;
}

interface BlogContextType {
  articles: Article[];
  categories: Category[];
  stats: BlogStats;
  allComments: AdminCommentView[];
  isLiveDbConnected: boolean;
  addArticle: (art: Omit<Article, '_id' | 'views' | 'likes' | 'comments'>) => Promise<void>;
  updateArticle: (id: string, art: Partial<Article>) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  likeArticle: (id: string) => Promise<void>;
  addComment: (articleId: string, comment: Omit<Comment, '_id' | 'createdAt' | 'status'>) => Promise<void>;
  updateCommentStatus: (articleId: string, commentId: string, status: Comment['status']) => Promise<void>;
  deleteComment: (articleId: string, commentId: string) => Promise<void>;
  addCategory: (cat: { name: string; description?: string }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  subscribers: string[];
  subscribeNewsletter: (email: string) => Promise<{ success: boolean; message: string }>;
  fetchFilteredArticles: (params?: { search?: string; category?: string; tag?: string }) => Promise<void>;
  refreshData: () => Promise<void>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem('codenest_articles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= initialArticles.length) {
          return parsed;
        }
      } catch (_) {}
    }
    return initialArticles;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('codenest_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= initialCategories.length) {
          return parsed;
        }
      } catch (_) {}
    }
    return initialCategories;
  });

  const [subscribers, setSubscribers] = useState<string[]>(() => {
    const saved = localStorage.getItem('codenest_subscribers');
    return saved ? JSON.parse(saved) : ['developer@techcommunity.org'];
  });

  const [allComments, setAllComments] = useState<AdminCommentView[]>([]);
  const [isLiveDbConnected, setIsLiveDbConnected] = useState<boolean>(false);

  const [stats, setStats] = useState<BlogStats>({
    totalArticles: initialArticles.length,
    publishedArticles: initialArticles.filter(a => a.status === 'Published').length,
    draftArticles: 0,
    totalComments: 8,
    totalViews: 52000,
    totalLikes: 3450
  });

  const fetchFilteredArticles = useCallback(async (params?: { search?: string; category?: string; tag?: string }) => {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.set('search', params.search);
      if (params?.category && params.category !== 'All') query.set('category', params.category);
      if (params?.tag) query.set('tag', params.tag);

      const res = await fetch(`${API_BASE}/blogs?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.blogs && Array.isArray(data.blogs)) {
          setArticles(data.blogs);
          setIsLiveDbConnected(true);
        }
      }
    } catch (e) {
      console.warn('[CodeNest] Filter query fallback to local cache.');
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      // 1. Fetch all blogs (for admin and public cache)
      const res = await fetch(`${API_BASE}/blogs-all`);
      if (res.ok) {
        let liveBlogs = await res.json();
        
        // If live database has fewer blogs than the comprehensive seed list, trigger reseed or sync
        if (Array.isArray(liveBlogs) && liveBlogs.length < initialArticles.length) {
          try {
            const reseedRes = await fetch(`${API_BASE}/blogs/reseed`);
            if (reseedRes.ok) {
              const reseedData = await reseedRes.json();
              if (reseedData.blogs && Array.isArray(reseedData.blogs) && reseedData.blogs.length > 0) {
                liveBlogs = reseedData.blogs;
              }
            }
          } catch (_) {}

          // Direct API sync for any remaining missing articles
          if (liveBlogs.length < initialArticles.length) {
            const existingTitles = new Set(liveBlogs.map((b: any) => b.title));
            for (const art of initialArticles) {
              if (!existingTitles.has(art.title)) {
                try {
                  const createRes = await fetch(`${API_BASE}/blogs`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(art)
                  });
                  if (createRes.ok) {
                    const savedArt = await createRes.json();
                    liveBlogs.push(savedArt);
                  }
                } catch (_) {}
              }
            }
          }
        }

        if (Array.isArray(liveBlogs) && liveBlogs.length > 0) {
          setArticles(liveBlogs);
          setIsLiveDbConnected(true);
        }
      }

      // 2. Fetch categories
      const catRes = await fetch(`${API_BASE}/blog/categories-all`);
      if (catRes.ok) {
        let liveCats = await catRes.json();
        if (Array.isArray(liveCats) && liveCats.length < initialCategories.length) {
          const existingCatNames = new Set(liveCats.map((c: any) => c.name));
          for (const cat of initialCategories) {
            if (!existingCatNames.has(cat.name)) {
              try {
                const addCatRes = await fetch(`${API_BASE}/blog/categories`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(cat)
                });
                if (addCatRes.ok) {
                  const savedCat = await addCatRes.json();
                  liveCats.push(savedCat);
                }
              } catch (_) {}
            }
          }
        }

        if (Array.isArray(liveCats) && liveCats.length >= initialCategories.length) {
          setCategories(liveCats);
        } else {
          setCategories(initialCategories);
        }
      }

      // 3. Fetch CMS stats
      const statsRes = await fetch(`${API_BASE}/blogs/stats`);
      if (statsRes.ok) {
        const liveStats = await statsRes.json();
        setStats(liveStats);
      }

      // 4. Fetch all comments for moderation
      const commRes = await fetch(`${API_BASE}/comments/all`);
      if (commRes.ok) {
        const liveComm = await commRes.json();
        if (Array.isArray(liveComm)) {
          setAllComments(liveComm);
        }
      }
    } catch (err) {
      console.log('[CodeNest] Operating in local cached mode until backend connects.');
      setIsLiveDbConnected(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (articles.length > 0) {
      const pub = articles.filter(a => a.status === 'Published').length;
      const drf = articles.filter(a => a.status === 'Draft').length;
      const totalV = articles.reduce((sum, a) => sum + (a.views || 0), 0);
      const totalL = articles.reduce((sum, a) => sum + (a.likes || 0), 0);
      const totalC = articles.reduce((sum, a) => sum + (a.comments?.length || 0), 0);
      setStats({
        totalArticles: articles.length,
        publishedArticles: pub,
        draftArticles: drf,
        totalViews: totalV,
        totalLikes: totalL,
        totalComments: totalC
      });
    }
  }, [articles]);

  useEffect(() => {
    localStorage.setItem('codenest_articles', JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem('codenest_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('codenest_subscribers', JSON.stringify(subscribers));
  }, [subscribers]);

  const addArticle = async (art: Omit<Article, '_id' | 'views' | 'likes' | 'comments'>) => {
    const tempId = `art-${Date.now()}`;
    const newArt: Article = {
      ...art,
      _id: tempId,
      views: 1,
      likes: 0,
      comments: []
    };

    setArticles(prev => [newArt, ...prev]);

    try {
      const res = await fetch(`${API_BASE}/blogs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(art)
      });
      if (res.ok) {
        const saved = await res.json();
        setArticles(prev => prev.map(a => a._id === tempId ? saved : a));
        refreshData();
      }
    } catch (e) {
      console.warn('[CodeNest] Saved article to local storage fallback.');
    }
  };

  const updateArticle = async (id: string, updated: Partial<Article>) => {
    setArticles(prev => prev.map(a => a._id === id ? { ...a, ...updated } : a));

    try {
      await fetch(`${API_BASE}/blogs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      refreshData();
    } catch (e) {
      console.warn('[CodeNest] Updated article in local storage fallback.');
    }
  };

  const deleteArticle = async (id: string) => {
    setArticles(prev => prev.filter(a => a._id !== id));

    try {
      await fetch(`${API_BASE}/blogs/${id}`, { method: 'DELETE' });
      refreshData();
    } catch (e) {
      console.warn('[CodeNest] Deleted article in local storage fallback.');
    }
  };

  const likeArticle = async (id: string) => {
    setArticles(prev => prev.map(a => a._id === id ? { ...a, likes: a.likes + 1 } : a));

    try {
      await fetch(`${API_BASE}/blog/${id}/like`, { method: 'POST' });
    } catch (e) {
      // Local state updated
    }
  };

  const addComment = async (articleId: string, comment: Omit<Comment, '_id' | 'createdAt' | 'status'>) => {
    const newComm: Comment = {
      ...comment,
      _id: `comm-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'Approved'
    };
    setArticles(prev => prev.map(a => a._id === articleId ? { ...a, comments: [newComm, ...a.comments] } : a));

    try {
      await fetch(`${API_BASE}/blog/${articleId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comment)
      });
      refreshData();
    } catch (e) {
      // Local fallback
    }
  };

  const updateCommentStatus = async (articleId: string, commentId: string, status: Comment['status']) => {
    setArticles(prev => prev.map(a => {
      if (a._id !== articleId) return a;
      return {
        ...a,
        comments: a.comments.map(c => c._id === commentId ? { ...c, status } : c)
      };
    }));

    setAllComments(prev => prev.map(c => c._id === commentId ? { ...c, status } : c));

    try {
      await fetch(`${API_BASE}/blog/${articleId}/comments/${commentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (e) {
      // Handled
    }
  };

  const deleteComment = async (articleId: string, commentId: string) => {
    setArticles(prev => prev.map(a => {
      if (a._id !== articleId) return a;
      return {
        ...a,
        comments: a.comments.filter(c => c._id !== commentId)
      };
    }));

    setAllComments(prev => prev.filter(c => c._id !== commentId));

    try {
      await fetch(`${API_BASE}/blog/${articleId}/comments/${commentId}`, { method: 'DELETE' });
    } catch (e) {
      // Handled
    }
  };

  const addCategory = async (cat: { name: string; description?: string }) => {
    try {
      const res = await fetch(`${API_BASE}/blog/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cat)
      });
      if (res.ok) {
        const savedCat = await res.json();
        setCategories(prev => [...prev, savedCat]);
      }
    } catch (e) {
      // Handled
    }
  };

  const deleteCategory = async (id: string) => {
    setCategories(prev => prev.filter(c => c._id !== id));
    try {
      await fetch(`${API_BASE}/blog/categories/${id}`, { method: 'DELETE' });
    } catch (e) {
      // Handled
    }
  };

  const subscribeNewsletter = async (email: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });
      const data = await res.json();
      if (res.ok) {
        if (!subscribers.includes(cleanEmail)) {
          setSubscribers(prev => [...prev, cleanEmail]);
        }
        return { success: true, message: 'Thank you for subscribing to CodeNest updates!' };
      } else if (res.status === 409) {
        return { success: false, message: 'This email is already subscribed.' };
      } else {
        return { success: false, message: data.message || 'Subscription failed.' };
      }
    } catch (e) {
      // Local fallback
      if (!subscribers.includes(cleanEmail)) {
        setSubscribers(prev => [...prev, cleanEmail]);
        return { success: true, message: 'Subscribed successfully (offline mode).' };
      }
      return { success: false, message: 'Email already subscribed.' };
    }
  };

  return (
    <BlogContext.Provider value={{
      articles, categories, stats, allComments, isLiveDbConnected,
      addArticle, updateArticle, deleteArticle, likeArticle,
      addComment, updateCommentStatus, deleteComment,
      addCategory, deleteCategory,
      subscribers, subscribeNewsletter,
      fetchFilteredArticles, refreshData
    }}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) throw new Error('useBlog must be used within BlogProvider');
  return context;
};
