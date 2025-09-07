import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    navigate('/profile');
    setIsDropdownOpen(false);
  };

  const handleLogoutClick = () => {
    onLogout();
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
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
      </nav>

      <div className="auth-container">
        {!isAuthenticated ? (
          <button 
            className="login-button azure-ad"
            onClick={onLogin}
          >
            Login with Microsoft
          </button>
        ) : (
          <div className="user-dropdown" ref={dropdownRef}>
            <button 
              className="user-button"
              onClick={toggleDropdown}
              aria-expanded={isDropdownOpen}
            >
              <span className="user-status">✓</span>
              <span className="user-name">
                {user?.name || user?.email || 'Authenticated'}
              </span>
              <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
            </button>
            
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <button 
                  className="dropdown-item"
                  onClick={handleProfileClick}
                >
                  <span className="dropdown-icon">👤</span>
                  Profile
                </button>
                <div className="dropdown-divider" />
                <button 
                  className="dropdown-item logout"
                  onClick={handleLogoutClick}
                >
                  <span className="dropdown-icon">🚪</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
