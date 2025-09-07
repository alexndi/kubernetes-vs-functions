import React from 'react';

// Loading component used throughout the application
export interface LoadingComponentProps {
  message?: string;
}

export const LoadingComponent: React.FC<LoadingComponentProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="loading">
      {message}
    </div>
  );
};

export default LoadingComponent;
