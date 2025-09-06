import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { LoadingComponent } from '../common/LoadingComponent';
import { usePost } from '../../hooks/usePost';
import { formatDate, getCategoryFromTags } from '../../utils/helpers';

export interface PostDetailPageProps {
  isAuthenticated: boolean;
}

export const PostDetailPage: React.FC<PostDetailPageProps> = ({ isAuthenticated }) => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { post, loading, error } = usePost(postId || '', isAuthenticated);

  if (loading) return <LoadingComponent />;
  if (error) return <div className="error">Error: {error}</div>;
  if (!post) return <LoadingComponent message="Post not found" />;

  const primaryCategory = getCategoryFromTags(post.tags);

  return (
    <div className="post-detail">
      <button
        className="back-button"
        onClick={() => navigate(`/category/${primaryCategory}`)}
      >
        ← Back to {primaryCategory} articles
      </button>

      <article>
        <h2>{post.title}</h2>
        <div className="post-meta">
          <span className="post-author">By {post.author}</span>
          <span className="post-date">{formatDate(post.date)}</span>
        </div>

        <div className="post-content markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code(props: any) {
                const { children, className, node, ...rest } = props;
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
            {post.content || ''}
          </ReactMarkdown>
        </div>

        <div className="post-tags">
          {post.tags?.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </article>
    </div>
  );
};

export default PostDetailPage;
