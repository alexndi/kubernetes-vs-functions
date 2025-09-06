// Header component
import React from 'react';
import { Link } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import { CATEGORIES } from '../../utils/constants';

function AppHeader() {
  const { keycloak, initialized } = useKeycloak();

  const handleAuth = () => {
    if (!initialized) {
      return;
    }

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
        {CATEGORIES.map((category) => (
          <Link key={category.id} to={`/category/${category.id}`}>
            <button>{category.name}</button>
          </Link>
        ))}
        {keycloak.authenticated && (
          <Link to="/profile">
            <button>Profile</button>
          </Link>
        )}
      </nav>

      <div className="auth-container">
        <button className="login-button keycloak" onClick={handleAuth} disabled={!initialized}>
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

export default AppHeader;
