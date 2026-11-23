const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const Category = require("../models/Category");

// 📘 Get paginated blogs for reader view (PUBLISHED ONLY)
const getPaginatedBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const { category, tag, search } = req.query;
    
    // Strict requirement: Public visitors only see published articles
    const filter = { 
      status: { $in: ['Published', 'published'] } 
    };

    if (category && category !== 'All' && category !== 'all') {
      filter.$or = [
        { category: new RegExp(`^${category}$`, 'i') },
        { category: category }
      ];
    }

    if (tag && tag.trim() !== '') {
      filter.tags = { $in: [new RegExp(tag.trim(), 'i')] };
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { content: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }

    const totalBlogs = await Blog.countDocuments(filter);
    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Only return approved comments to public visitors
    const sanitizedBlogs = blogs.map(b => {
      const obj = b.toObject();
      if (obj.comments) {
        obj.comments = obj.comments.filter(c => c.status === 'Approved');
      }
      return obj;
    });

    res.status(200).json({
      blogs: sanitizedBlogs,
      totalBlogs,
      totalPages: Math.ceil(totalBlogs / limit) || 1,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching paginated blogs:", error);
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
};

// Admin endpoint: Get ALL blogs (both published and drafts)
const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching all blogs:", error);
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
};

// Admin CMS Statistics KPI
const getBlogStats = async (req, res) => {
  try {
    const totalArticles = await Blog.countDocuments();
    const publishedArticles = await Blog.countDocuments({ status: { $in: ['Published', 'published'] } });
    const draftArticles = await Blog.countDocuments({ status: { $in: ['Draft', 'draft'] } });

    const statsAgg = await Blog.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
          totalLikes: { $sum: "$likes" },
          totalComments: { $sum: { $size: { $ifNull: ["$comments", []] } } }
        }
      }
    ]);

    const stats = statsAgg[0] || { totalViews: 0, totalLikes: 0, totalComments: 0 };

    res.json({
      totalArticles,
      publishedArticles,
      draftArticles,
      totalComments: stats.totalComments,
      totalViews: stats.totalViews,
      totalLikes: stats.totalLikes
    });
  } catch (err) {
    console.error("Error fetching blog stats:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

const getBlogsByCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const categoryDoc = await Category.findOne({
      $or: [
        { slug: slug },
        { name: new RegExp(`^${slug.replace(/-/g, ' ')}$`, 'i') }
      ]
    });

    const categoryMatchers = [
      { category: slug },
      { category: new RegExp(`^${slug.replace(/-/g, ' ')}$`, 'i') },
      { category: new RegExp(slug.replace(/-/g, '.*'), 'i') }
    ];

    if (categoryDoc) {
      categoryMatchers.push({ category: categoryDoc.name });
    }

    const filter = { 
      $or: categoryMatchers,
      status: { $in: ['Published', 'published'] }
    };

    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Blog.countDocuments(filter);

    res.status(200).json({ blogs, total, totalPages: Math.ceil(total / limit) || 1 });
  } catch (error) {
    console.error("Error fetching blogs by category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const reseedDatabase = async (req, res) => {
  try {
    const { seedDatabaseIfEmpty } = require('../utils/seedData');
    await seedDatabaseIfEmpty();
    const allBlogs = await Blog.find().sort({ createdAt: -1 });
    const allCategories = await Category.find().sort({ name: 1 });
    res.json({ message: "Database reseeded successfully", totalBlogs: allBlogs.length, totalCategories: allCategories.length, blogs: allBlogs, categories: allCategories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTags = async (req, res) => {
  try {
    const tags = await Blog.distinct("tags");
    res.status(200).json(tags.filter(Boolean));
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ message: "Failed to fetch tags" });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;
    if (!name) return res.status(400).json({ error: "Category name is required" });

    const category = new Category({
      name: name.trim(),
      description: description || '',
      image: image || ''
    });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error("Create Category Error:", err);
    res.status(500).json({ error: err.message || "Failed to create category" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Category not found" });
    res.json({ message: "Category deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete category" });
  }
};

// Get single blog by ID or Slug with atomic view increment
const getSingleBlog = async (req, res) => {
  const { id } = req.params;
  try {
    let blog;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
    } else {
      blog = await Blog.findOneAndUpdate({ slug: id }, { $inc: { views: 1 } }, { new: true });
    }

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.status(200).json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create article (supports Draft and Published status)
const createBlog = async (req, res) => {
  try {
    const { title, excerpt, content, category, tags, coverImage, author, status } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required fields." });
    }

    // Auto-calculate reading time: average 200 words per minute
    const wordCount = content.trim().split(/\s+/).length;
    const calcReadTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

    const blog = new Blog({
      title,
      excerpt: excerpt || content.slice(0, 160) + '...',
      content,
      category: category || 'Software Architecture',
      tags: tags || ['Engineering'],
      coverImage: coverImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
      author: author || {
        name: 'Technical Support Engineer',
        role: 'Full-Stack Developer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      },
      status: status === 'Draft' || status === 'draft' ? 'Draft' : 'Published',
      readTime: calcReadTime,
      views: 1,
      likes: 0,
      comments: []
    });

    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    console.error("Create Blog Error:", error);
    res.status(500).json({ error: error.message || "Failed to create blog" });
  }
};

const updateBlog = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.content) {
      const wordCount = updateData.content.trim().split(/\s+/).length;
      updateData.readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.status(200).json(blog);
  } catch (error) {
    console.error("Update Blog Error:", error);
    res.status(500).json({ error: "Failed to update blog" });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.status(200).json({ message: "Blog deleted successfully", id: req.params.id });
  } catch (error) {
    console.error("Delete Blog Error:", error);
    res.status(500).json({ error: "Failed to delete blog" });
  }
};

// Atomic like increment
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true });
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.status(200).json({ likes: blog.likes });
  } catch (error) {
    console.error("Toggle Like Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Add comment to article
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { authorName, authorEmail, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Comment content cannot be empty" });
    }

    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    const newComment = {
      authorName: authorName ? authorName.trim() : "Anonymous Reader",
      authorEmail: authorEmail ? authorEmail.trim().toLowerCase() : "",
      content: content.trim(),
      status: "Approved", // Approved by default or configurable
      createdAt: new Date()
    };

    blog.comments.unshift(newComment);
    await blog.save();
    res.status(201).json(blog.comments[0]);
  } catch (error) {
    console.error("Add Comment Error:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
};

// Update comment moderation status (Approved / Spam / Pending)
const updateCommentStatus = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { status } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    const comment = blog.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    comment.status = status;
    await blog.save();
    res.json({ message: "Comment status updated", comment });
  } catch (error) {
    console.error("Update Comment Status Error:", error);
    res.status(500).json({ error: "Failed to update comment status" });
  }
};

// Delete comment from article
const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    blog.comments = blog.comments.filter(c => c._id.toString() !== commentId);
    await blog.save();
    res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
};

// Fetch all comments across all articles for admin moderation table
const getAllComments = async (req, res) => {
  try {
    const blogs = await Blog.find({}, 'title comments');
    const allComments = [];

    blogs.forEach(blog => {
      if (blog.comments && blog.comments.length > 0) {
        blog.comments.forEach(c => {
          allComments.push({
            _id: c._id,
            articleId: blog._id,
            articleTitle: blog.title,
            authorName: c.authorName,
            authorEmail: c.authorEmail,
            content: c.content,
            status: c.status,
            createdAt: c.createdAt
          });
        });
      }
    });

    allComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(allComments);
  } catch (error) {
    console.error("Get All Comments Error:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};

module.exports = {
  getPaginatedBlogs,
  getAllBlogs,
  getBlogStats,
  getSingleBlog,
  getBlogsByCategory,
  getTags,
  getCategories,
  getAllCategories,
  createCategory,
  deleteCategory,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLike,
  addComment,
  updateCommentStatus,
  deleteComment,
  getAllComments,
  reseedDatabase,
};
