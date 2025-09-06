// Loading component
import React from 'react';

const LoadingComponent: React.FC = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '1.2rem',
      backgroundColor: '#121212',
      color: '#e0e0e0',
    }}
  >
    <div>Loading authentication...</div>
  </div>
);

export default LoadingComponent;
