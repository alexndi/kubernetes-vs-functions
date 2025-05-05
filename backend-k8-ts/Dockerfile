FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy source files
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy built app from builder stage
COPY --from=builder /app/dist ./dist

# Create a script to handle startup
RUN echo '#!/bin/sh\n\
# Wait for PostgreSQL to be ready\n\
echo "Waiting for PostgreSQL..."\n\
COUNT=0\n\
until node -e "const { Pool } = require(\"pg\"); const pool = new Pool({ host: process.env.POSTGRES_HOST || \"postgres-service\", port: process.env.POSTGRES_PORT || 5432, database: process.env.POSTGRES_DB || \"itblog\", user: process.env.POSTGRES_USER || \"bloguser\", password: process.env.POSTGRES_PASSWORD || \"password\" }); pool.query(\"SELECT 1\").then(() => { console.log(\"PostgreSQL is ready!\"); process.exit(0); }).catch(err => { console.error(\"PostgreSQL is not ready:\", err); process.exit(1); });" 2>/dev/null\n\
do\n\
  COUNT=$((COUNT+1))\n\
  if [ $COUNT -ge 30 ]; then\n\
    echo "Timeout waiting for PostgreSQL. Exiting."\n\
    exit 1\n\
  fi\n\
  echo "Waiting for PostgreSQL... ($COUNT/30)"\n\
  sleep 2\n\
done\n\
\n\
# Run database migrations\n\
echo "Running database migrations..."\n\
npm run migrate\n\
\n\
# Run the application\n\
echo "Starting application..."\n\
exec node dist/app.js\n\
' > /app/entrypoint.sh

RUN chmod +x /app/entrypoint.sh

EXPOSE 3001

CMD ["/app/entrypoint.sh"]