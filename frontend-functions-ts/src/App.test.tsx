import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the DevInsights title', () => {
  render(<App />);
  const titleElement = screen.getByText(/DevInsights/i);
  expect(titleElement).toBeInTheDocument();
});