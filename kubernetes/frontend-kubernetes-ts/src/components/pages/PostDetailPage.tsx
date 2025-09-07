// Post Detail Page Component with Markdown Rendering
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Post } from '../../types';
import { usePostDetail } from '../../hooks/usePosts';

function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  
  const { fetchPostDetail, loading, error } = usePostDetail();

  const loadPostDetail = useCallback(async () => {
    if (!postId) return;
    
    const post = await fetchPostDetail(postId);
    if (post) {
      setSelectedPost(post);
    }
  }, [postId, fetchPostDetail]);

  useEffect(() => {
    loadPostDetail();
  }, [loadPostDetail]);

  const getCategoryFromTags = (): string => {
    if (!selectedPost) return 'programming';
    
    const categories = ['programming', 'devops', 'cloud', 'security'];
    const foundCategory = categories.find((cat) => selectedPost.tags.includes(cat));
    return foundCategory || 'programming';
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (error) {
    return <div className="error">Error: {error}</div>;
  }
  
  if (!selectedPost) {
    return <div className="loading">Post not found</div>;
  }

  return (
    <div className="post-detail">
      <button
        className="back-button"
        onClick={() => navigate(`/category/${getCategoryFromTags()}`)}
      >
        ← Back to list
      </button>

      <article>
        <h2>{selectedPost.title}</h2>
        <div className="post-meta">
          <span className="post-author">By {selectedPost.author}</span>
          <span className="post-date">{new Date(selectedPost.date).toLocaleDateString()}</span>
        </div>

        <div className="post-content markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code(props: any) {
                const { children, className, ...rest } = props;
                const match = /language-(\w+)/.exec(className || '');
                const isCodeBlock = match && !props.inline;

                if (isCodeBlock) {
                  return (
                    <div className="code-block-wrapper">
                      <div className="code-language-label">{match[1]}</div>
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          borderRadius: '0 0 8px 8px',
                          padding: '1.5rem',
                          fontSize: '0.9rem',
                          lineHeight: 1.5,
                        }}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  );
                }

                return (
                  <code className="inline-code" {...rest}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {selectedPost.content || ''}
          </ReactMarkdown>
        </div>

        <div className="post-tags">
          {selectedPost.tags?.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </article>
    </div>
  );
}

export default PostDetailPage;
