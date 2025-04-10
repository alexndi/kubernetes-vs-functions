# Weather API Frontend

This React application connects to both the Kubernetes and Azure Functions backend services, allowing you to easily compare both implementations.

## Configuration

Before running the application, make sure to update the backend URLs in `src/App.js`:

```javascript
const BACKENDS = {
  kubernetes: 'http://YOUR_MINIKUBE_IP:YOUR_NODEPORT', // e.g., http://192.168.49.2:32751
  azure: 'http://localhost:7071'                       // Local Azure Functions port
};