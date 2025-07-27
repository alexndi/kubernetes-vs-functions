import { BlogPost, PostsByCategory, PostError, PostDetail, AuthConfig } from '../models/blog';

describe('Blog Models', () => {
  describe('BlogPost interface', () => {
    it('should define a valid blog post structure', () => {
      const post: BlogPost = {
        id: 'test-post-1',
        title: 'Test Post',
        author: 'Test Author',
        date: '2025-01-01T00:00:00Z',
        excerpt: 'Test excerpt',
        tags: ['typescript', 'testing']
      };

      expect(post.id).toBe('test-post-1');
      expect(post.title).toBe('Test Post');
      expect(post.author).toBe('Test Author');
      expect(post.tags).toEqual(['typescript', 'testing']);
    });

    it('should allow optional content and userCanComment properties', () => {
      const post: BlogPost = {
        id: 'test-post-1',
        title: 'Test Post',
        author: 'Test Author',
        date: '2025-01-01T00:00:00Z',
        excerpt: 'Test excerpt',
        tags: ['typescript'],
        content: 'Full post content',
        userCanComment: true
      };

      expect(post.content).toBe('Full post content');
      expect(post.userCanComment).toBe(true);
    });
  });

  describe('PostsByCategory interface', () => {
    it('should define a valid posts by category structure', () => {
      const response: PostsByCategory = {
        category: 'programming',
        posts: [{
          id: 'test-post-1',
          title: 'Test Post',
          author: 'Test Author',
          date: '2025-01-01T00:00:00Z',
          excerpt: 'Test excerpt',
          tags: ['typescript']
        }],
        timestamp: '2025-01-01T00:00:00Z'
      };

      expect(response.category).toBe('programming');
      expect(response.posts).toHaveLength(1);
      expect(response.timestamp).toBe('2025-01-01T00:00:00Z');
    });

    it('should allow optional userInfo property', () => {
      const response: PostsByCategory = {
        category: 'programming',
        posts: [],
        timestamp: '2025-01-01T00:00:00Z',
        userInfo: {
          isAuthenticated: true,
          displayName: 'testuser'
        }
      };

      expect(response.userInfo?.isAuthenticated).toBe(true);
      expect(response.userInfo?.displayName).toBe('testuser');
    });
  });

  describe('PostError interface', () => {
    it('should define a valid error response structure', () => {
      const error: PostError = {
        error: 'Post not found',
        timestamp: '2025-01-01T00:00:00Z'
      };

      expect(error.error).toBe('Post not found');
      expect(error.timestamp).toBe('2025-01-01T00:00:00Z');
    });

    it('should allow optional availableCategories property', () => {
      const error: PostError = {
        error: 'Category not found',
        availableCategories: ['programming', 'devops'],
        timestamp: '2025-01-01T00:00:00Z'
      };

      expect(error.availableCategories).toEqual(['programming', 'devops']);
    });
  });

  describe('PostDetail interface', () => {
    it('should extend BlogPost with timestamp', () => {
      const postDetail: PostDetail = {
        id: 'test-post-1',
        title: 'Test Post',
        author: 'Test Author',
        date: '2025-01-01T00:00:00Z',
        excerpt: 'Test excerpt',
        content: 'Full content',
        tags: ['typescript'],
        timestamp: '2025-01-01T00:00:00Z'
      };

      expect(postDetail.timestamp).toBe('2025-01-01T00:00:00Z');
      expect(postDetail.content).toBe('Full content');
    });
  });

  describe('AuthConfig interface', () => {
    it('should define a valid auth configuration structure', () => {
      const authConfig: AuthConfig = {
        realm: 'test-realm',
        url: 'http://localhost:8080',
        clientId: 'test-client'
      };

      expect(authConfig.realm).toBe('test-realm');
      expect(authConfig.url).toBe('http://localhost:8080');
      expect(authConfig.clientId).toBe('test-client');
    });
  });
});