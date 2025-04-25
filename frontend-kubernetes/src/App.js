// App.js for the Kubernetes version with Keycloak integration and profile page
import React, { useState, useEffect } from 'react';
import './App.css';
import { initKeycloak, getKeycloak } from './services/keycloak';

function App() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [keycloakInitialized, setKeycloakInitialized] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  
  // Kubernetes backend URL - update this with your actual nodeport
  const BACKEND_URL = 'http://localhost:3001';
  
  // Initialize Keycloak
  useEffect(() => {
    initKeycloak()
      .then(authenticated => {
        setIsLoggedIn(authenticated);
        setKeycloakInitialized(true);
      })
      .catch(error => {
        console.error('Failed to initialize Keycloak', error);
        setKeycloakInitialized(true);
      });
  }, []);
  
  const fetchPosts = async (selectedCategory) => {
    setLoading(true);
    setError(null);
    
    const keycloak = getKeycloak();
    const headers = {};
    
    if (keycloak && keycloak.authenticated) {
      headers.Authorization = `Bearer ${keycloak.token}`;
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/posts/${selectedCategory}`, {
        headers: headers
      });
      
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
    
    const keycloak = getKeycloak();
    const headers = {};
    
    if (keycloak && keycloak.authenticated) {
      headers.Authorization = `Bearer ${keycloak.token}`;
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/post/${postId}`, {
        headers: headers
      });
      
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
  
  // Fetch user profile 
  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    
    const keycloak = getKeycloak();
    const headers = {};
    
    if (keycloak && keycloak.authenticated) {
      headers.Authorization = `Bearer ${keycloak.token}`;
      
      try {
        const response = await fetch(`${BACKEND_URL}/api/user/profile`, {
          headers: headers
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setUserProfile(data);
        setCurrentPage('profile');
      } catch (err) {
        setError(err.message);
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setError('You must be logged in to view your profile');
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
    const keycloak = getKeycloak();
    if (keycloak) {
      if (isLoggedIn) {
        keycloak.logout();
      } else {
        keycloak.login();
      }
    }
  };
  
  return (
    <div className="App kubernetes-theme">
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
          {isLoggedIn && (
            <button 
              className={currentPage === 'profile' ? 'active' : ''} 
              onClick={fetchUserProfile}
            >
              Profile
            </button>
          )}
        </nav>
        
        <div className="auth-container">
          <button className="login-button keycloak" onClick={handleLoginClick}>
            {isLoggedIn ? 'Logout' : 'Login with Keycloak'}
          </button>
        </div>
      </header>
      
      <main>
        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">Error: {error}</div>}
        
        {currentPage === 'home' && (
          <div className="home-page">
            <div className="hero-section">
              <h2>Welcome to DevInsights Blog</h2>
              <p className="hero-text">
                Your source for in-depth technical articles on programming, DevOps, cloud, and security
              </p>
              <p className="hero-subtitle">
                Powered by containerized microservices running on Kubernetes
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
        )}
        
        {currentPage === 'blog' && !selectedPost && (
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
        
        {currentPage === 'blog' && selectedPost && (
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
        )}
        
        {currentPage === 'profile' && userProfile && (
          <div className="profile-container">
            <h2>User Profile</h2>
            <div className="profile-card">
              <div className="profile-header">
                <h3>{userProfile.user.preferred_username || userProfile.user.name || 'User'}</h3>
                {userProfile.user.email && <p className="profile-email">{userProfile.user.email}</p>}
              </div>
              
              <div className="profile-details">
                <h4>Account Information</h4>
                <p><strong>User ID:</strong> {userProfile.user.sub}</p>
                {userProfile.user.given_name && (
                  <p><strong>First Name:</strong> {userProfile.user.given_name}</p>
                )}
                {userProfile.user.family_name && (
                  <p><strong>Last Name:</strong> {userProfile.user.family_name}</p>
                )}
                
                <h4>Roles and Permissions</h4>
                {userProfile.user.realm_access && userProfile.user.realm_access.roles ? (
                  <ul className="role-list">
                    {userProfile.user.realm_access.roles.map(role => (
                      <li key={role} className="role-item">{role}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No specific roles assigned</p>
                )}
                
                <div className="profile-message">
                  <p>{userProfile.message}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <footer>
        <p>DevInsights Blog - Kubernetes Edition</p>
        <p className="server-info">
          Server: Kubernetes Cluster | Node Port: 32751
        </p>
      </footer>
    </div>
  );
}

export default App;