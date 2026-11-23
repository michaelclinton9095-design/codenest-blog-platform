export interface Comment {
  _id: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: string;
  status: 'Approved' | 'Pending' | 'Spam';
}

export interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  coverImage: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  status: 'Published' | 'Draft';
  publishedAt: string;
  readTime: string;
  views: number;
  likes: number;
  comments: Comment[];
  featured?: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  articleCount: number;
}
