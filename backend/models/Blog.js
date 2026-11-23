const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  authorName: { type: String, required: true },
  authorEmail: { type: String, default: '' },
  content: { type: String, required: true },
  status: { type: String, enum: ['Approved', 'Pending', 'Spam'], default: 'Approved' },
  createdAt: { type: Date, default: Date.now }
});

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true },
  excerpt: { type: String, default: '' },
  content: { type: String, required: true },
  category: { type: String, required: true, default: 'Engineering' },
  tags: [{ type: String }],
  coverImage: { type: String, default: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80' },

  author: {
    name: { type: String, default: 'Technical Support Engineer' },
    role: { type: String, default: 'Full-Stack Developer' },
    avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' }
  },

  status: { type: String, enum: ['Published', 'Draft', 'draft', 'published'], default: 'Published' },
  publishedAt: { type: Date, default: Date.now },
  readTime: { type: String, default: '5 min read' },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },

  comments: [commentSchema],

  // Legacy field fallbacks for backwards compatibility
  titleLine1: { type: String },
  titleLine2: { type: String },
  image: { type: String },
  contentParagraphs: [{ type: String }]
}, { timestamps: true });

// Auto-generate slug before save if missing
blogSchema.pre('save', function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .concat('-', Date.now().toString().slice(-4));
  }
  if (!this.titleLine1 && this.title) {
    this.titleLine1 = this.title;
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
