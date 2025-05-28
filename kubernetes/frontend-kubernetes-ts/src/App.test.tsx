import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the Keycloak service
jest.mock('./services/keycloak', () => ({
  initKeycloak: jest.fn().mockResolvedValue(false),
  getKeycloak: jest.fn().mockReturnValue(null),
  login: jest.fn(),
  logout: jest.fn()
}));

test('renders the DevInsights title', () => {
  render(<App />);
  const titleElement = screen.getByText(/DevInsights/i);
  expect(titleElement).toBeInTheDocument();
});