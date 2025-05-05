// src/blog-service.ts
import { BlogRepository } from './repositories/blog-repository';
import { BlogPost, PostsByCategory, PostError, PostDetail } from './models/blog';

export class BlogService {
  private repository: BlogRepository;

  constructor(repository?: BlogRepository) {
    this.repository = repository || new BlogRepository();
  }

  async getAllCategories(): Promise<string[]> {
    try {
      return await this.repository.getAllCategories();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  async getPostsByCategory(category: string): Promise<PostsByCategory | PostError> {
    try {
      return await this.repository.getPostsByCategory(category);
    } catch (error) {
      console.error(`Error fetching posts for category ${category}:`, error);
      throw new Error(`Failed to fetch posts for category ${category}`);
    }
  }

  async getPostById(postId: string): Promise<PostDetail | PostError> {
    try {
      return await this.repository.getPostById(postId);
    } catch (error) {
      console.error(`Error fetching post with ID ${postId}:`, error);
      throw new Error(`Failed to fetch post with ID ${postId}`);
    }
  }
}

export default BlogService;