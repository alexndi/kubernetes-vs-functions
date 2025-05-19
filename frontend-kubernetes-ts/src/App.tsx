import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import './App.css';
import { initKeycloak, getKeycloak, login, logout } from './services/keycloak';

// Define types for our data structures
interface Post {
  id: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  tags: string[];
  content?: string;
  userCanComment?: boolean;
}

interface UserProfile {
  user: {
    sub: string;
    preferred_username?: string;
    name?: string;
    email?: string;
    given_name?: string;
    family_name?: string;
    realm_access?: {
      roles: string[];
    };
  };
  message: string;
}

// Main App component
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [keycloakInitialized, setKeycloakInitialized] = useState<boolean>(false);
  
  // Initialize Keycloak
  useEffect(() => {
    initKeycloak(
      (authenticated: boolean) => {
        setIsLoggedIn(authenticated);
        setKeycloakInitialized(true);
      },
      (error: Error) => {
        console.error('Keycloak error:', error);
        setKeycloakInitialized(true);
      }
    )
    .catch(error => {
      console.error('Failed to initialize Keycloak', error);
      setKeycloakInitialized(true);
    });
  }, []);
  
  // Handle login button click
  const handleLoginClick = (): void => {
    if (isLoggedIn) {
      logout();
    } else {
      login();
    }
  };
  
  return (
    <Router>
      <div className="App kubernetes-theme">
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
            {isLoggedIn && (
              <Link to="/profile">
                <button>Profile</button>
              </Link>
            )}
          </nav>
          
          <div className="auth-container">
            <button className="login-button keycloak" onClick={handleLoginClick}>
              {isLoggedIn ? 'Logout' : 'Login with Keycloak'}
            </button>
          </div>
        </header>
        
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:categoryName" element={<BlogPage />} />
            <Route path="/post/:postId" element={<PostDetailPage />} />
            <Route path="/profile" element={
              isLoggedIn ? <ProfilePage /> : <Navigate to="/" replace />
            } />
          </Routes>
        </main>
        
        <footer>
          <p>DevInsights Blog - Kubernetes Edition</p>
          <p className="server-info">
            Server: Kubernetes Cluster | Node Port: 32751
          </p>
        </footer>
      </div>
    </Router>
  );
}

// Home Page Component
function HomePage() {
  const navigate = useNavigate();
  
  const handleCategoryClick = (category: string) => {
    navigate(`/category/${category}`);
  };
  
  return (
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

// Blog Page Component (category view)
function BlogPage() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Kubernetes backend URL - update this with your actual nodeport
  const BACKEND_URL: string = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
  
  useEffect(() => {
    if (categoryName) {
      fetchPosts(categoryName);
    }
  }, [categoryName]);
  
  const fetchPosts = async (selectedCategory: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    const keycloak = getKeycloak();
    const headers: HeadersInit = {};
    
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
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        console.error('Error fetching posts:', err);
      } else {
        setError('An unknown error occurred');
        console.error('Unknown error:', err);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">Error: {error}</div>}
      
      <h2 className="category-title">{categoryName && categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Articles</h2>
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

// Post Detail Page Component
function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Kubernetes backend URL
  const BACKEND_URL: string = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
  
  useEffect(() => {
    if (postId) {
      fetchPostDetail(postId);
    }
  }, [postId]);
  
  const fetchPostDetail = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    const keycloak = getKeycloak();
    const headers: HeadersInit = {};
    
    if (keycloak && keycloak.authenticated) {
      headers.Authorization = `Bearer ${keycloak.token}`;
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/post/${id}`, {
        headers: headers
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSelectedPost(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        console.error('Error fetching post detail:', err);
      } else {
        setError('An unknown error occurred');
        console.error('Unknown error:', err);
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!selectedPost) return <div className="loading">Post not found</div>;
  
  // Get the category from the tags to navigate back
  const getCategoryFromTags = (): string => {
    const categories = ['programming', 'devops', 'cloud', 'security'];
    const foundCategory = categories.find(cat => selectedPost.tags.includes(cat));
    return foundCategory || 'programming';
  };
  
  return (
    <div className="post-detail">
      <button className="back-button" onClick={() => navigate(`/category/${getCategoryFromTags()}`)}>
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
  );
}

// Profile Page Component
function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Kubernetes backend URL
  const BACKEND_URL: string = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
  
  useEffect(() => {
    fetchUserProfile();
  }, []);
  
  const fetchUserProfile = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    const keycloak = getKeycloak();
    const headers: HeadersInit = {};
    
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
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
          console.error('Error fetching user profile:', err);
        } else {
          setError('An unknown error occurred');
          console.error('Unknown error:', err);
        }
      } finally {
        setLoading(false);
      }
    } else {
      setError('You must be logged in to view your profile');
      setLoading(false);
    }
  };
  
  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!userProfile) return <div className="loading">Profile not found</div>;
  
  return (
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
  );
}

export default App;