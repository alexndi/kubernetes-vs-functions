// functions/backend-functions-ts/__tests__/models.test.ts
import { BlogPost, PostsByCategory, PostError, ApiResponseMessage } from '../models/blog';

describe('Blog Models', () => {
  it('should create a valid BlogPost', () => {
    const post: BlogPost = {
      id: 'test-1',
      title: 'Test Post',
      author: 'Test Author',
      date: '2025-01-01T00:00:00Z',
      excerpt: 'Test excerpt',
      tags: ['test']
    };

    expect(post.id).toBe('test-1');
    expect(post.title).toBe('Test Post');
    expect(post.tags).toContain('test');
  });

  it('should create a valid PostsByCategory response', () => {
    const response: PostsByCategory = {
      category: 'programming',
      posts: [],
      timestamp: '2025-01-01T00:00:00Z'
    };

    expect(response.category).toBe('programming');
    expect(Array.isArray(response.posts)).toBe(true);
    expect(response.timestamp).toBeDefined();
  });

  it('should create a valid PostError', () => {
    const error: PostError = {
      error: 'Not found',
      timestamp: '2025-01-01T00:00:00Z'
    };

    expect(error.error).toBe('Not found');
    expect(error.timestamp).toBeDefined();
  });

  it('should create a valid ApiResponseMessage', () => {
    const response: ApiResponseMessage = {
      message: 'API Ready',
      endpoints: {
        getAllCategories: '/api/categories',
        getPostsByCategory: '/api/posts/{category}',
        getPostById: '/api/post/{id}',
        health: '/api/health'
      }
    };

    expect(response.message).toBe('API Ready');
    expect(response.endpoints.health).toBe('/api/health');
  });
});