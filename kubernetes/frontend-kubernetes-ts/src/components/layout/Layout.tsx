// Main layout component
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';
import HomePage from '../pages/HomePage';
import BlogPage from '../pages/BlogPage';
import PostDetailPage from '../pages/PostDetailPage';
import ProfilePage from '../pages/ProfilePage';
import ProtectedRoute from '../common/ProtectedRoute';

function Layout() {
  return (
    <>
      <AppHeader />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:categoryName" element={<BlogPage />} />
          <Route path="/post/:postId" element={<PostDetailPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <AppFooter />
    </>
  );
}

export default Layout;
