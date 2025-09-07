import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LoadingComponent } from '../common/LoadingComponent';
import { usePosts } from '../../hooks/usePosts';
import { capitalizeFirst, formatDate } from '../../utils/helpers';

export interface BlogPageProps {
  isAuthenticated: boolean;
}

export const BlogPage: React.FC<BlogPageProps> = ({ isAuthenticated }) => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const navigate = useNavigate();
  const { posts, loading, error } = usePosts(categoryName || '', isAuthenticated);

  if (loading) return <LoadingComponent />;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <>
      <h2 className="category-title">
        {categoryName && capitalizeFirst(categoryName)} Articles
      </h2>
      <div className="posts-grid">
        {posts.map((post) => (
          <div key={post.id} className="post-card" onClick={() => navigate(`/post/${post.id}`)}>
            <h3>{post.title}</h3>
            <p className="post-excerpt">{post.excerpt}</p>
            <div className="post-footer">
              <span className="post-author">{post.author}</span>
              <span className="post-date">{formatDate(post.date)}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default BlogPage;
