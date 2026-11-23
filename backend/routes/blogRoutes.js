const express = require("express");
const { 
  getPaginatedBlogs, 
  getAllBlogs,
  getBlogStats,
  getTags,  
  getCategories, 
  getAllCategories,
  createCategory,
  deleteCategory,
  getSingleBlog, 
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLike, 
  addComment,
  updateCommentStatus,
  deleteComment,
  getAllComments,
  getBlogsByCategory,
  reseedDatabase
} = require("../controllers/blogController");

const router = express.Router();

// Reseed / Sync endpoint
router.get('/blogs/reseed', reseedDatabase);
router.post('/blogs/reseed', reseedDatabase);

// Specific routes first
router.get('/blogs/stats', getBlogStats);
router.get('/blog/tags', getTags);
router.get('/blog/categories', getCategories);
router.get('/blog/categories-all', getAllCategories);
router.post('/blog/categories', createCategory);
router.delete('/blog/categories/:id', deleteCategory);
router.get('/blog/category/:slug', getBlogsByCategory);

// Blog routes
router.get("/blogs", getPaginatedBlogs);
router.get("/blogs-all", getAllBlogs);
router.post("/blogs", createBlog);

router.get("/blog/:id", getSingleBlog);
router.get("/blogs/:id", getSingleBlog);
router.put("/blogs/:id", updateBlog);
router.delete("/blogs/:id", deleteBlog);
router.post('/blog/:id/like', toggleLike);
router.post('/blogs/:id/like', toggleLike);

// Comment routes
router.get('/comments/all', getAllComments);
router.post('/blog/:id/comments', addComment);
router.post('/blogs/:id/comments', addComment);
router.put('/blog/:id/comments/:commentId/status', updateCommentStatus);
router.delete('/blog/:id/comments/:commentId', deleteComment);

module.exports = router;
