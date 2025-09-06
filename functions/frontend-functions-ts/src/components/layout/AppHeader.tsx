import React from 'react';
import { Link } from 'react-router-dom';
import { UserProfile } from '../../types';
import { CATEGORIES, CATEGORY_LABELS } from '../../utils/constants';

export interface AppHeaderProps {
  isAuthenticated: boolean;
  user: UserProfile | null;
  onLogin: () => void;
  onLogout: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  isAuthenticated,
  user,
  onLogin,
  onLogout
}) => {
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
        <Link to={`/category/${CATEGORIES.PROGRAMMING}`}>
          <button>{CATEGORY_LABELS.programming}</button>
        </Link>
        <Link to={`/category/${CATEGORIES.DEVOPS}`}>
          <button>{CATEGORY_LABELS.devops}</button>
        </Link>
        <Link to={`/category/${CATEGORIES.CLOUD}`}>
          <button>{CATEGORY_LABELS.cloud}</button>
        </Link>
        <Link to={`/category/${CATEGORIES.SECURITY}`}>
          <button>{CATEGORY_LABELS.security}</button>
        </Link>
        {isAuthenticated && (
          <Link to="/profile">
            <button>Profile</button>
          </Link>
        )}
      </nav>

      <div className="auth-container">
        <button 
          className="login-button azure-ad"
          onClick={isAuthenticated ? onLogout : onLogin}
        >
          {isAuthenticated ? 'Logout' : 'Login with Microsoft'}
        </button>
        {isAuthenticated && user && (
          <span style={{ marginLeft: '10px', fontSize: '0.9rem', color: '#90EE90' }}>
            ✓ {user.name || user.email || 'Authenticated'}
          </span>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
