// src/repositories/blog-repository.ts
import { Pool } from 'pg';
import pool from '../config/database';
import { BlogPost, PostsByCategory, PostError, PostDetail } from '../models/blog';

export class BlogRepository {
  private pool: Pool;

  constructor(dbPool?: Pool) {
    this.pool = dbPool || pool;
  }

  /**
   * Get all categories
   */
  public async getAllCategories(): Promise<string[]> {
    const { rows } = await this.pool.query('SELECT name FROM categories ORDER BY name');
    return rows.map((row) => row.name);
  }

  /**
   * Get posts by category name
   */
  public async getPostsByCategory(categoryName: string): Promise<PostsByCategory | PostError> {
    const normalizedCategory = categoryName.toLowerCase();

    // First check if the category exists
    const categoryResult = await this.pool.query('SELECT id FROM categories WHERE name = $1', [
      normalizedCategory,
    ]);

    if (categoryResult.rows.length === 0) {
      // Category doesn't exist, return error with available categories
      const availableCategoriesResult = await this.pool.query('SELECT name FROM categories');
      return {
        error: 'Category not found',
        availableCategories: availableCategoriesResult.rows.map((row) => row.name),
        timestamp: new Date().toISOString(),
      };
    }

    const categoryId = categoryResult.rows[0].id;

    // Get posts for this category
    const postsResult = await this.pool.query(
      `
      SELECT p.id, p.slug, p.title, p.author, p.date, p.excerpt, 
             ARRAY_AGG(t.name) AS tags
      FROM posts p
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.category_id = $1
      GROUP BY p.id
      ORDER BY p.date DESC
    `,
      [categoryId],
    );

    // Transform the raw data into the expected format
    const posts: BlogPost[] = postsResult.rows.map((row) => ({
      id: row.slug, // Use slug as the external ID
      title: row.title,
      author: row.author,
      date: row.date,
      excerpt: row.excerpt,
      tags: row.tags.filter((tag: string | null) => tag !== null), // Filter out null tags
    }));

    return {
      category: normalizedCategory,
      posts,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get a single post by its slug
   */
  public async getPostById(postId: string): Promise<PostDetail | PostError> {
    // Use the slug as the external ID
    const postResult = await this.pool.query(
      `
      SELECT p.id, p.slug, p.title, p.author, p.date, p.excerpt, p.content,
             ARRAY_AGG(t.name) AS tags
      FROM posts p
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.slug = $1
      GROUP BY p.id
    `,
      [postId],
    );

    if (postResult.rows.length === 0) {
      return {
        error: 'Post not found',
        timestamp: new Date().toISOString(),
      };
    }

    const row = postResult.rows[0];

    return {
      id: row.slug,
      title: row.title,
      author: row.author,
      date: row.date,
      excerpt: row.excerpt,
      content: row.content,
      tags: row.tags.filter((tag: string | null) => tag !== null),
      timestamp: new Date().toISOString(),
    };
  }
}

export default BlogRepository;
