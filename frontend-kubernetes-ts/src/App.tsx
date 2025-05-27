import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import { ReactKeycloakProvider, useKeycloak } from '@react-keycloak/web';
import keycloak from './services/keycloak';
import './App.css';

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

// Loading component
const LoadingComponent: React.FC = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontSize: '1.2rem',
    backgroundColor: '#121212',
    color: '#e0e0e0'
  }}>
    <div>Loading authentication...</div>
  </div>
);

// Main App component
function App() {
  // Keycloak initialization options
  const initOptions = {
    onLoad: 'check-sso' as const,
    pkceMethod: 'S256' as const,
    checkLoginIframe: false,
    flow: 'standard' as const
  };

  const handleKeycloakEvent = useCallback((event: string, error?: any) => {
    // Silent event handling - no logging
  }, []);

  const handleKeycloakTokens = useCallback((tokens: any) => {
    // Silent token handling - no logging
  }, []);

  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={initOptions}
      LoadingComponent={LoadingComponent}
      onEvent={handleKeycloakEvent}
      onTokens={handleKeycloakTokens}
    >
      <Router>
        <div className="App kubernetes-theme">
          <AppContent />
        </div>
      </Router>
    </ReactKeycloakProvider>
  );
}

// Separate AppContent component that uses the Keycloak context
function AppContent() {
  return (
    <>
      <AppHeader />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:categoryName" element={<BlogPage />} />
          <Route path="/post/:postId" element={<PostDetailPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Routes>
      </main>
      <AppFooter />
    </>
  );
}

// Header component
function AppHeader() {
  const { keycloak, initialized } = useKeycloak();

  const handleAuth = () => {
    if (!initialized) return;

    if (keycloak.authenticated) {
      keycloak.logout();
    } else {
      keycloak.login();
    }
  };

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
        {keycloak.authenticated && (
          <Link to="/profile">
            <button>Profile</button>
          </Link>
        )}
      </nav>
      
      <div className="auth-container">
        <button 
          className="login-button keycloak" 
          onClick={handleAuth}
          disabled={!initialized}
        >
          {keycloak.authenticated ? 'Logout' : 'Login with Keycloak'}
        </button>
        {keycloak.authenticated && (
          <span style={{ marginLeft: '10px', fontSize: '0.9rem', color: '#90EE90' }}>
            ✓ {keycloak.tokenParsed?.preferred_username || 'Authenticated'}
          </span>
        )}
      </div>
    </header>
  );
}

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return <div className="loading">Loading...</div>;
  }

  if (!keycloak.authenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
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

// Blog Page Component
function BlogPage() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { keycloak, initialized } = useKeycloak();
  
  const BACKEND_URL: string = process.env.REACT_APP_BACKEND_URL || 'https://devinsights.site/api';
  
  const fetchPosts = useCallback(async (selectedCategory: string): Promise<void> => {
    if (!initialized) return;
    
    setLoading(true);
    setError(null);
    
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    
    if (keycloak.authenticated && keycloak.token) {
      headers.Authorization = `Bearer ${keycloak.token}`;
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}/posts/${selectedCategory}`, { headers });
      
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
  }, [BACKEND_URL, keycloak.authenticated, keycloak.token, initialized]);

  useEffect(() => {
    if (categoryName && initialized) {
      fetchPosts(categoryName);
    }
  }, [categoryName, fetchPosts, initialized]);
  
  if (!initialized) {
    return <div className="loading">Loading...</div>;
  }
  
  return (
    <>
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">Error: {error}</div>}
      
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

// Post Detail Page Component
function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { keycloak, initialized } = useKeycloak();
  
  const BACKEND_URL: string = process.env.REACT_APP_BACKEND_URL || 'https://devinsights.site/api';
  
  const fetchPostDetail = useCallback(async (id: string): Promise<void> => {
    if (!initialized) return;
    
    setLoading(true);
    setError(null);
    
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    
    if (keycloak.authenticated && keycloak.token) {
      headers.Authorization = `Bearer ${keycloak.token}`;
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}/post/${id}`, { headers });
      
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
  }, [BACKEND_URL, keycloak.authenticated, keycloak.token, initialized]);

  useEffect(() => {
    if (postId && initialized) {
      fetchPostDetail(postId);
    }
  }, [postId, fetchPostDetail, initialized]);
  
  if (!initialized) return <div className="loading">Loading...</div>;
  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!selectedPost) return <div className="loading">Post not found</div>;
  
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
  const { keycloak, initialized } = useKeycloak();
  
  const BACKEND_URL: string = process.env.REACT_APP_BACKEND_URL || 'https://devinsights.site/api';
  
  const fetchUserProfile = useCallback(async (): Promise<void> => {
    if (!initialized || !keycloak.authenticated || !keycloak.token) {
      setError('Authentication required');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // Check token expiration and refresh if needed
      if (keycloak.isTokenExpired()) {
        await keycloak.updateToken(30);
      }
      
      const response = await fetch(`${BACKEND_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${keycloak.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load profile: ${response.status}`);
      }
      
      const data = await response.json();
      setUserProfile(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL, keycloak, initialized]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);
  
  if (!initialized) return <div className="loading">Loading...</div>;
  if (loading) return <div className="loading">Loading profile...</div>;
  
  if (error) {
    return (
      <div className="profile-container">
        <div className="error">
          <h3>Unable to load profile</h3>
          <p>{error}</p>
          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={fetchUserProfile} 
              style={{ 
                padding: '10px 20px', 
                marginRight: '10px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
            <button 
              onClick={() => keycloak.login()} 
              style={{ 
                padding: '10px 20px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Re-login
            </button>
          </div>
        </div>
      </div>
    );
  }
  
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

// Footer component
function AppFooter() {
  const { keycloak } = useKeycloak();
  
  return (
    <footer>
      <p>DevInsights Blog - Kubernetes Edition</p>
      <p className="server-info">
        Server: Kubernetes Cluster | Auth: {keycloak.authenticated ? keycloak.tokenParsed?.preferred_username || 'Authenticated' : 'Anonymous'}
      </p>
    </footer>
  );
}

export default App;