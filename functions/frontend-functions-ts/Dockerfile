# functions/frontend-functions-ts/Dockerfile

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set environment variables for build
ARG REACT_APP_BACKEND_URL=https://api.functions.devinsights.site
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# Accept build arguments with defaults
ARG REACT_APP_ENTRA_CLIENT_ID=1d40f916-03d8-41a4-859b-9431cff65d99
ARG REACT_APP_ENTRA_AUTHORITY=https://devinsightsblog.ciamlogin.com/d1125adb-c883-4751-83de-4946aa0825ff

# Set environment variables for build (React needs these at build time)
ENV REACT_APP_ENTRA_CLIENT_ID=$REACT_APP_ENTRA_CLIENT_ID
ENV REACT_APP_ENTRA_AUTHORITY=$REACT_APP_ENTRA_AUTHORITY
ENV CI=false

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]