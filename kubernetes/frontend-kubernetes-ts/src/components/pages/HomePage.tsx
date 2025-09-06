// Home Page Component
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../../utils/constants';

function HomePage() {
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
        <p className="hero-subtitle">
          Powered by containerized microservices running on Kubernetes
        </p>
      </div>

      <div className="category-grid">
        {CATEGORIES.map((category) => (
          <div 
            key={category.id}
            className="category-card" 
            onClick={() => handleCategoryClick(category.id)}
          >
            <h3>{category.name}</h3>
            <p>{category.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
