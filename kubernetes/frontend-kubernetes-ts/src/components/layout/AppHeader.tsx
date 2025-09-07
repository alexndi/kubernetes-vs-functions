// Header component
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import { CATEGORIES } from '../../utils/constants';

function AppHeader() {
  const { keycloak, initialized } = useKeycloak();
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

  const handleLogin = () => {
    if (initialized && !keycloak.authenticated) {
      keycloak.login();
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsDropdownOpen(false);
  };

  const handleLogoutClick = () => {
    if (initialized && keycloak.authenticated) {
      keycloak.logout();
    }
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const getUserDisplayName = () => {
    return keycloak.tokenParsed?.preferred_username || 
           keycloak.tokenParsed?.name || 
           keycloak.tokenParsed?.given_name || 
           'Authenticated';
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
        {CATEGORIES.map((category) => (
          <Link key={category.id} to={`/category/${category.id}`}>
            <button>{category.name}</button>
          </Link>
        ))}
      </nav>

      <div className="auth-container">
        {!keycloak.authenticated ? (
          <button 
            className="login-button keycloak" 
            onClick={handleLogin} 
            disabled={!initialized}
          >
            Login with Keycloak
          </button>
        ) : (
          <div className="user-dropdown" ref={dropdownRef}>
            <button 
              className="user-button"
              onClick={toggleDropdown}
              aria-expanded={isDropdownOpen}
              disabled={!initialized}
            >
              <span className="user-status">✓</span>
              <span className="user-name">
                {getUserDisplayName()}
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
}

export default AppHeader;
