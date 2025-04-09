## Azure Functions Version

### Prerequisites
- Node.js
- Azure Functions Core Tools
- Azure CLI (for deployment to Azure)

### Local Development

1. Navigate to the Azure Functions version directory:
   ```
   cd weather-api-functions
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the function app locally:
   ```
   npm start
   ```
   This will start the function app at http://localhost:7071

4. Test the API:
   ```
   curl http://localhost:7071/api/weather/london
   ```

5. Deploy to Azure:
   ```
   func azure functionapp publish <your-function-app-name>
   ```