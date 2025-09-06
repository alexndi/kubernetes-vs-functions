// Main App component - Clean and organized structure
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { LoadingComponent, Layout } from './components';
import { useAuth } from './hooks';
import './App.css';

// Main App component
function App() {
  const { isAuthenticated, user, loading, login, logout } = useAuth();

  if (loading) {
    return <LoadingComponent message="Initializing application..." />;
  }

  return (
    <Router>
      <div className="App azure-theme">
        <Layout 
          isAuthenticated={isAuthenticated}
          user={user}
          onLogin={login}
          onLogout={logout}
        />
      </div>
    </Router>
  );
}

export default App;