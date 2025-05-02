# DevInsights Blog Frontend - TypeScript Azure Functions Version

This project is a React-based TypeScript frontend for the DevInsights blog application that connects to the Azure Functions API backend.

## Features

- Browse blog posts by category
- Read individual blog posts
- Responsive design for desktop and mobile
- Prepared for Azure AD authentication (to be implemented)
- Fully typed with TypeScript

## Getting Started

### Prerequisites

- Node.js 14+ installed
- The Azure Functions backend running (on port 7071 by default)

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

The app will open in your default browser at [http://localhost:3000](http://localhost:3000).

### Configuration

If your Azure Functions backend runs on a different port or URL, update the `BACKEND_URL` constant in `src/App.tsx`.

## Project Structure

- `src/App.tsx` - Main application component
- `src/App.css` - Application styles
- `src/index.tsx` - React entry point
- `src/services/` - Service modules for authentication and API calls
- `public/` - Static assets

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Future Enhancements

- Integration with Azure AD for authentication
- User profiles and personalized content
- Comment functionality for authenticated users
- Search functionality