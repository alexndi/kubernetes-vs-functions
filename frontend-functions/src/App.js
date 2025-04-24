// App.js for the Azure Functions version
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Azure Functions backend URL
  const BACKEND_URL = 'http://localhost:7071';
  
  const fetchPosts = async (selectedCategory) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/posts/${selectedCategory}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setPosts(data.posts);
      setSelectedPost(null); // Reset selected post when fetching new category
    } catch (err) {
      setError(err.message);
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPostDetail = async (postId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/post/${postId}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSelectedPost(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching post detail:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle category selection
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    fetchPosts(newCategory);
    setCurrentPage('blog');
  };
  
  // Go to home page
  const goHome = () => {
    setCurrentPage('home');
    setCategory(null);
    setSelectedPost(null);
  };
  
  // Handle login button click
  const handleLoginClick = () => {
    // For now, just toggle login state for demonstration
    setIsLoggedIn(!isLoggedIn);
    
    // In a real implementation, this would redirect to Azure AD
    console.log("Would redirect to Azure AD login");
    // window.location.href = "https://login.microsoftonline.com/...";
  };
  
  return (
    <div className="App azure-theme">
      <header className="App-header">
        <div className="logo" onClick={goHome}>
          <h1>DevInsights</h1>
        </div>
        
        <nav className="main-nav">
          <button 
            className={currentPage === 'home' ? 'active' : ''} 
            onClick={goHome}
          >
            Home
          </button>
          <button 
            className={category === 'programming' ? 'active' : ''} 
            onClick={() => handleCategoryChange('programming')}
          >
            Programming
          </button>
          <button 
            className={category === 'devops' ? 'active' : ''} 
            onClick={() => handleCategoryChange('devops')}
          >
            DevOps
          </button>
          <button 
            className={category === 'cloud' ? 'active' : ''} 
            onClick={() => handleCategoryChange('cloud')}
          >
            Cloud
          </button>
          <button 
            className={category === 'security' ? 'active' : ''} 
            onClick={() => handleCategoryChange('security')}
          >
            Security
          </button>
        </nav>
        
        <div className="auth-container">
          <button className="login-button azure-ad" onClick={handleLoginClick}>
            {isLoggedIn ? 'Logout' : 'Login with Microsoft'}
          </button>
        </div>
      </header>
      
      <main>
        {currentPage === 'home' ? (
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
              <div className="category-card" onClick={() => handleCategoryChange('programming')}>
                <h3>Programming</h3>
                <p>Articles about languages, frameworks, and software development best practices</p>
              </div>
              <div className="category-card" onClick={() => handleCategoryChange('devops')}>
                <h3>DevOps</h3>
                <p>Continuous integration, deployment, and modern operational practices</p>
              </div>
              <div className="category-card" onClick={() => handleCategoryChange('cloud')}>
                <h3>Cloud</h3>
                <p>Cloud platforms, services, architectures, and deployment strategies</p>
              </div>
              <div className="category-card" onClick={() => handleCategoryChange('security')}>
                <h3>Security</h3>
                <p>Application security, secure coding practices, and threat mitigation</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {loading && <div className="loading">Loading...</div>}
            {error && <div className="error">Error: {error}</div>}
            
            {selectedPost ? (
              <div className="post-detail">
                <button className="back-button" onClick={() => setSelectedPost(null)}>
                  ← Back to list
                </button>
                
                <article>
                  <h2>{selectedPost.title}</h2>
                  <div className="post-meta">
                    <span className="post-author">By {selectedPost.author}</span>
                    <span className="post-date">{new Date(selectedPost.date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="post-content">
                    {selectedPost.content?.split('\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                  
                  <div className="post-tags">
                    {selectedPost.tags?.map(tag => (
                      <span className="tag" key={tag}>{tag}</span>
                    ))}
                  </div>
                </article>
              </div>
            ) : (
              <>
                <h2 className="category-title">{category && category.charAt(0).toUpperCase() + category.slice(1)} Articles</h2>
                <div className="posts-grid">
                  {posts.map(post => (
                    <div 
                      key={post.id} 
                      className="post-card"
                      onClick={() => fetchPostDetail(post.id)}
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
            )}
          </>
        )}
      </main>
      
      <footer>
        <p>DevInsights Blog - Azure Functions Edition</p>
        <p className="server-info">
          Server: Azure Functions | Port: 7071
        </p>
      </footer>
    </div>
  );
}

export default App;