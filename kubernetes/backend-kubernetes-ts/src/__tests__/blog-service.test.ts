import { BlogService } from '../blog-service';
import { BlogRepository } from '../repositories/blog-repository';
import { PostsByCategory, PostDetail, PostError } from '../models/blog';

// Mock the repository
jest.mock('../repositories/blog-repository');

describe('BlogService', () => {
  let blogService: BlogService;
  let mockRepository: jest.Mocked<BlogRepository>;

  beforeEach(() => {
    // Create a mock repository
    mockRepository = new BlogRepository() as jest.Mocked<BlogRepository>;
    blogService = new BlogService(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCategories', () => {
    it('should return all categories successfully', async () => {
      // Arrange
      const mockCategories = ['programming', 'devops', 'cloud', 'security'];
      mockRepository.getAllCategories.mockResolvedValue(mockCategories);

      // Act
      const result = await blogService.getAllCategories();

      // Assert
      expect(result).toEqual(mockCategories);
      expect(mockRepository.getAllCategories).toHaveBeenCalledTimes(1);
    });

    it('should throw error when repository fails', async () => {
      // Arrange
      mockRepository.getAllCategories.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(blogService.getAllCategories()).rejects.toThrow('Failed to fetch categories');
    });
  });

  describe('getPostsByCategory', () => {
    it('should return posts for valid category', async () => {
      // Arrange
      const category = 'programming';
      const mockResponse: PostsByCategory = {
        category: 'programming',
        posts: [
          {
            id: 'test-post-1',
            title: 'Test Post 1',
            author: 'Test Author',
            date: '2025-01-01T00:00:00Z',
            excerpt: 'Test excerpt',
            tags: ['typescript', 'testing']
          }
        ],
        timestamp: '2025-01-01T00:00:00Z'
      };
      mockRepository.getPostsByCategory.mockResolvedValue(mockResponse);

      // Act
      const result = await blogService.getPostsByCategory(category);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockRepository.getPostsByCategory).toHaveBeenCalledWith(category);
    });

    it('should return error for invalid category', async () => {
      // Arrange
      const category = 'invalid-category';
      const mockError: PostError = {
        error: 'Category not found',
        availableCategories: ['programming', 'devops', 'cloud', 'security'],
        timestamp: '2025-01-01T00:00:00Z'
      };
      mockRepository.getPostsByCategory.mockResolvedValue(mockError);

      // Act
      const result = await blogService.getPostsByCategory(category);

      // Assert
      expect(result).toEqual(mockError);
      expect('error' in result).toBe(true);
    });

    it('should throw error when repository fails', async () => {
      // Arrange
      const category = 'programming';
      mockRepository.getPostsByCategory.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(blogService.getPostsByCategory(category)).rejects.toThrow(
        'Failed to fetch posts for category programming'
      );
    });
  });

  describe('getPostById', () => {
    it('should return post for valid ID', async () => {
      // Arrange
      const postId = 'test-post-1';
      const mockPost: PostDetail = {
        id: 'test-post-1',
        title: 'Test Post 1',
        author: 'Test Author',
        date: '2025-01-01T00:00:00Z',
        excerpt: 'Test excerpt',
        content: 'Test content',
        tags: ['typescript', 'testing'],
        timestamp: '2025-01-01T00:00:00Z'
      };
      mockRepository.getPostById.mockResolvedValue(mockPost);

      // Act
      const result = await blogService.getPostById(postId);

      // Assert
      expect(result).toEqual(mockPost);
      expect(mockRepository.getPostById).toHaveBeenCalledWith(postId);
    });

    it('should return error for invalid post ID', async () => {
      // Arrange
      const postId = 'invalid-post-id';
      const mockError: PostError = {
        error: 'Post not found',
        timestamp: '2025-01-01T00:00:00Z'
      };
      mockRepository.getPostById.mockResolvedValue(mockError);

      // Act
      const result = await blogService.getPostById(postId);

      // Assert
      expect(result).toEqual(mockError);
      expect('error' in result).toBe(true);
    });

    it('should throw error when repository fails', async () => {
      // Arrange
      const postId = 'test-post-1';
      mockRepository.getPostById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(blogService.getPostById(postId)).rejects.toThrow(
        'Failed to fetch post with ID test-post-1'
      );
    });
  });
});