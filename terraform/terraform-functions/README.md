# Step 1: Navigate to your functions directory
cd functions/backend-functions-ts

# Step 2: Install dependencies and build
npm install
npm run build

# Step 3: Login to Azure (if not already logged in)
az login

# Step 4: Deploy to your Function App
func azure functionapp publish func-devinsights


# Set your migration key (use the one you generated above)
MIGRATION_KEY="your-generated-key-here"
FUNCTION_URL="https://func-devinsights.azurewebsites.net/api/db/migrate"

# Test the function is working
echo "Testing function accessibility..."
curl -f "$FUNCTION_URL?operation=migrate&key=$MIGRATION_KEY" || echo "Function not ready yet"

# Run migrations and seeding (recommended first run)
echo "Running migrations and seeding..."
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $MIGRATION_KEY" \
  -d '{"operation": "migrate-and-seed"}' \
  "$FUNCTION_URL"

# Or run just migrations
echo "Running migrations only..."
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $MIGRATION_KEY" \
  -d '{"operation": "migrate"}' \
  "$FUNCTION_URL"

# Or run just seeding
echo "Running seeding only..."
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $MIGRATION_KEY" \
  -d '{"operation": "seed"}' \
  "$FUNCTION_URL"