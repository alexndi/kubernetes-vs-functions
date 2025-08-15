# Test CPU - Azure Functions
curl -X POST https://func-nbu-blog-api.azurewebsites.net/api/benchmark/cpu \
  -H "Content-Type: application/json" \
  -d '{"iterations": 100000, "complexity": 1}'

# Test CPU - Kubernetes
curl -X POST https://devinsights.site/api/benchmark/cpu \
  -H "Content-Type: application/json" \
  -d '{"iterations": 100000, "complexity": 1}'

# Test Memory - Azure Functions
curl -X POST https://func-nbu-blog-api.azurewebsites.net/api/benchmark/memory \
  -H "Content-Type: application/json" \
  -d '{"size_mb": 5, "operations": 50}'

# Test Memory - Kubernetes
curl -X POST https://devinsights.site/api/benchmark/memory \
  -H "Content-Type: application/json" \
  -d '{"size_mb": 5, "operations": 50}'

# Test Latency - Azure Functions
curl -X POST https://func-nbu-blog-api.azurewebsites.net/api/benchmark/latency \
  -H "Content-Type: application/json" \
  -d '{"db_queries": 3, "delay_ms": 10, "parallel": true}'

# Test Latency - Kubernetes
curl -X POST https://devinsights.site/api/benchmark/latency \
  -H "Content-Type: application/json" \
  -d '{"db_queries": 3, "delay_ms": 10, "parallel": true}'