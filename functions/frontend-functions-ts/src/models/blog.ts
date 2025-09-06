import { Post } from '../types';

// Blog-related data models and transformers
export class BlogPost implements Post {
  id: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  tags: string[];
  content?: string;

  constructor(data: Post) {
    this.id = data.id;
    this.title = data.title;
    this.author = data.author;
    this.date = data.date;
    this.excerpt = data.excerpt;
    this.tags = data.tags;
    this.content = data.content;
  }

  // Get formatted date
  getFormattedDate(): string {
    return new Date(this.date).toLocaleDateString();
  }

  // Get category from tags
  getPrimaryCategory(): string {
    const categories = ['programming', 'devops', 'cloud', 'security'];
    const foundCategory = categories.find(cat => this.tags.includes(cat));
    return foundCategory || 'programming';
  }

  // Check if post has full content
  hasFullContent(): boolean {
    return !!this.content && this.content.trim().length > 0;
  }
}

export default BlogPost;
