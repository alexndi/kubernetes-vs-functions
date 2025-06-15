// functions/frontend-functions-ts/src/App.tsx - Bulletproof solution
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './App.css';

// Global constants
const BACKEND_URL: string = process.env.REACT_APP_BACKEND_URL || 'http://localhost:7071/api';

// Define types for our data structures
interface Post {
  id: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  tags: string[];
  content?: string;
}

function App() {
  return (
    <Router>
      <div className="App azure-theme">
        <AppContent />
      </div>
    </Router>
  );
}

// Separate AppContent component that uses the Router context
function AppContent() {
  return (
    <>
      <AppHeader />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:categoryName" element={<BlogPage />} />
          <Route path="/post/:postId" element={<PostDetailPage />} />
        </Routes>
      </main>
      <AppFooter />
    </>
  );
}

// Header component with navigation
function AppHeader() {
  return (
    <header className="App-header">
      <div className="logo">
        <Link to="/">
          <h1>DevInsights</h1>
        </Link>
      </div>
      
      <nav className="main-nav">
        <Link to="/">
          <button>Home</button>
        </Link>
        <Link to="/category/programming">
          <button>Programming</button>
        </Link>
        <Link to="/category/devops">
          <button>DevOps</button>
        </Link>
        <Link to="/category/cloud">
          <button>Cloud</button>
        </Link>
        <Link to="/category/security">
          <button>Security</button>
        </Link>
      </nav>
      
      <div className="auth-container">
        <button className="login-button azure-ad">
          Login with Microsoft
        </button>
      </div>
    </header>
  );
}

// Home Page Component
function HomePage() {
  const navigate = useNavigate();
  
  const handleCategoryClick = useCallback((category: string) => {
    navigate(`/category/${category}`);
  }, [navigate]);
  
  return (
    <div className="home-page">
      <div className="hero-section">
        <h2>Welcome to DevInsights Blog</h2>
        <p className="hero-text">
          Your source for in-depth technical articles on programming, DevOps, cloud, and security
        </p>
        <p className="hero-subtitle">
          Powered by serverless Azure Functions
        </p>
      </div>
      
      <div className="category-grid">
        <div className="category-card" onClick={() => handleCategoryClick('programming')}>
          <h3>Programming</h3>
          <p>Articles about languages, frameworks, and software development best practices</p>
        </div>
        <div className="category-card" onClick={() => handleCategoryClick('devops')}>
          <h3>DevOps</h3>
          <p>Continuous integration, deployment, and modern operational practices</p>
        </div>
        <div className="category-card" onClick={() => handleCategoryClick('cloud')}>
          <h3>Cloud</h3>
          <p>Cloud platforms, services, architectures, and deployment strategies</p>
        </div>
        <div className="category-card" onClick={() => handleCategoryClick('security')}>
          <h3>Security</h3>
          <p>Application security, secure coding practices, and threat mitigation</p>
        </div>
      </div>
    </div>
  );
}

// Blog Page Component (for category listings)
function BlogPage() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchPosts = useCallback(async (selectedCategory: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/posts/${selectedCategory}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (categoryName) {
      fetchPosts(categoryName);
    }
  }, [categoryName, fetchPosts]);
  
  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  
  return (
    <>
      <h2 className="category-title">
        {categoryName && categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Articles
      </h2>
      <div className="posts-grid">
        {posts.map(post => (
          <div 
            key={post.id} 
            className="post-card"
            onClick={() => navigate(`/post/${post.id}`)}
          >
            <h3>{post.title}</h3>
            <p className="post-excerpt">{post.excerpt}</p>
            <div className="post-footer">
              <span className="post-author">{post.author}</span>
              <span className="post-date">{new Date(post.date).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// Post Detail Page Component with Markdown Rendering
function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchPostDetail = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/post/${id}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSelectedPost(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (postId) {
      fetchPostDetail(postId);
    }
  }, [postId, fetchPostDetail]);
  
  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!selectedPost) return <div className="loading">Post not found</div>;
  
  // Try to determine category from tags for back button
  const getCategoryFromTags = (): string => {
    const categories = ['programming', 'devops', 'cloud', 'security'];
    const foundCategory = categories.find(cat => selectedPost.tags.includes(cat));
    return foundCategory || 'programming';
  };
  
  return (
    <div className="post-detail">
      <button className="back-button" onClick={() => navigate(`/category/${getCategoryFromTags()}`)}>
        ← Back to {getCategoryFromTags()} articles
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
              }
            }}
          >
            {selectedPost.content || ''}
          </ReactMarkdown>
        </div>
        
        <div className="post-tags">
          {selectedPost.tags?.map(tag => (
            <span className="tag" key={tag}>{tag}</span>
          ))}
        </div>
      </article>
    </div>
  );
}

// Footer component
function AppFooter() {
  return (
    <footer>
      <p>DevInsights Blog - Azure Functions Edition</p>
      <p className="server-info">
        Server: Azure Functions | Container: Docker + Nginx
      </p>
    </footer>
  );
}

export default App;