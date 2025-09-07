import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_DESCRIPTIONS } from '../../utils/constants';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleCategoryClick = useCallback(
    (category: string) => {
      navigate(`/category/${category}`);
    },
    [navigate],
  );

  return (
    <div className="home-page">
      <div className="hero-section">
        <h2>Welcome to DevInsights Blog</h2>
        <p className="hero-text">
          Your source for in-depth technical articles on programming, DevOps, cloud, and security
        </p>
        <p className="hero-subtitle">Powered by serverless Azure Functions with Microsoft Entra External ID</p>
      </div>

      <div className="category-grid">
        <div className="category-card" onClick={() => handleCategoryClick(CATEGORIES.PROGRAMMING)}>
          <h3>{CATEGORY_LABELS.programming}</h3>
          <p>{CATEGORY_DESCRIPTIONS.programming}</p>
        </div>
        <div className="category-card" onClick={() => handleCategoryClick(CATEGORIES.DEVOPS)}>
          <h3>{CATEGORY_LABELS.devops}</h3>
          <p>{CATEGORY_DESCRIPTIONS.devops}</p>
        </div>
        <div className="category-card" onClick={() => handleCategoryClick(CATEGORIES.CLOUD)}>
          <h3>{CATEGORY_LABELS.cloud}</h3>
          <p>{CATEGORY_DESCRIPTIONS.cloud}</p>
        </div>
        <div className="category-card" onClick={() => handleCategoryClick(CATEGORIES.SECURITY)}>
          <h3>{CATEGORY_LABELS.security}</h3>
          <p>{CATEGORY_DESCRIPTIONS.security}</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
