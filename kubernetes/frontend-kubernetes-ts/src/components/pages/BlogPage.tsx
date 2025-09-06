// Blog Page Component
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Post } from '../../types';
import { usePosts } from '../../hooks/usePosts';

function BlogPage() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  
  const { fetchPostsByCategory, loading, error } = usePosts();

  const loadPosts = useCallback(async () => {
    if (!categoryName) return;
    
    const response = await fetchPostsByCategory(categoryName);
    if (response && response.posts) {
      setPosts(response.posts);
    }
  }, [categoryName, fetchPostsByCategory]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <>
      <h2 className="category-title">
        {categoryName && categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Articles
      </h2>
      
      <div className="posts-grid">
        {posts.map((post) => (
          <div key={post.id} className="post-card" onClick={() => navigate(`/post/${post.id}`)}>
            <h3>{post.title}</h3>
            <p className="post-excerpt">{post.excerpt}</p>
            <div className="post-footer">
              <span className="post-author">{post.author}</span>
              <span className="post-date">{new Date(post.date).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
      
      {posts.length === 0 && !loading && (
        <div className="no-posts">
          <p>No posts found in this category.</p>
        </div>
      )}
    </>
  );
}

export default BlogPage;
