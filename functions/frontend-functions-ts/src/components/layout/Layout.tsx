import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';
import { ProtectedRoute } from '../common/ProtectedRoute';
import { HomePage } from '../pages/HomePage';
import { BlogPage } from '../pages/BlogPage';
import { PostDetailPage } from '../pages/PostDetailPage';
import { ProfilePage } from '../pages/ProfilePage';
import { UserProfile } from '../../types';

export interface LayoutProps {
  isAuthenticated: boolean;
  user: UserProfile | null;
  onLogin: () => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  isAuthenticated,
  user,
  onLogin,
  onLogout
}) => {
  return (
    <>
      <AppHeader 
        isAuthenticated={isAuthenticated}
        user={user}
        onLogin={onLogin}
        onLogout={onLogout}
      />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/category/:categoryName" 
            element={<BlogPage isAuthenticated={isAuthenticated} />} 
          />
          <Route 
            path="/post/:postId" 
            element={<PostDetailPage isAuthenticated={isAuthenticated} />} 
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ProfilePage user={user} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <AppFooter isAuthenticated={isAuthenticated} user={user} />
    </>
  );
};

export default Layout;
