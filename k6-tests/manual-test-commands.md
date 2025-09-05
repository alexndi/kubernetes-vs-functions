# Manual Test Commands - Ultra Simple

If you want to test just one endpoint at a time manually, use these curl commands:

## Azure Functions (Serverless)

### CPU Test (Very Light)
```bash
curl -X POST https://func-nbu-blog-api.azurewebsites.net/api/benchmark/cpu \
  -H "Content-Type: application/json" \
  -d '{"iterations": 1000, "complexity": 1}'
```

### Memory Test (Very Light)  
```bash
curl -X POST https://func-nbu-blog-api.azurewebsites.net/api/benchmark/memory \
  -H "Content-Type: application/json" \
  -d '{"size_mb": 1, "operations": 10}'
```

### Latency Test (Very Light)
```bash
curl -X POST https://func-nbu-blog-api.azurewebsites.net/api/benchmark/latency \
  -H "Content-Type: application/json" \
  -d '{"db_queries": 1, "delay_ms": 0, "parallel": false}'
```

## Kubernetes

### CPU Test (Very Light)
```bash
curl -X POST https://devinsights.site/api/benchmark/cpu \
  -H "Content-Type: application/json" \
  -d '{"iterations": 1000, "complexity": 1}'
```

### Memory Test (Very Light)
```bash
curl -X POST https://devinsights.site/api/benchmark/memory \
  -H "Content-Type: application/json" \
  -d '{"size_mb": 1, "operations": 10}'
```

### Latency Test (Very Light)
```bash
curl -X POST https://devinsights.site/api/benchmark/latency \
  -H "Content-Type: application/json" \
  -d '{"db_queries": 1, "delay_ms": 0, "parallel": false}'
```

## What to Expect

Each endpoint should return a JSON response with:
- `test`: The test type (cpu/memory/latency)
- `metrics`: Performance metrics for that test type
- `platform`: Information about the platform (serverless vs kubernetes)
- `timestamp`: When the test was run

The responses will show you the performance characteristics and help you understand the format before running larger tests.
