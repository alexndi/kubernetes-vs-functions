# Azure Functions vs Kubernetes Performance Testing

This directory contains **streamlined load testing tools** designed for **trial accounts** that provide clean performance and cost comparison between Azure Functions and Kubernetes deployments.

## 🚀 What's Included

### **Simplified Testing** ✅
- ✅ **Progressive Load Testing**: 1→3→8→15 VUs across 3 phases
- ✅ **Realistic Workloads**: Light/Moderate/Heavy complexity levels
- ✅ **Essential Metrics**: CPU ops/sec, Memory usage, Response times
- ✅ **Cost Analysis**: Trial account impact and break-even points
- ✅ **Clean Results**: Simple comparison and recommendations

## 📊 Test Architecture

### Progressive Load Phases
```
Phase 1: Light      │ 1-3 VUs × 2m  │ Light workload (10K iterations)
Phase 2: Moderate   │ 1-8 VUs × 2m  │ Moderate workload (50K iterations)  
Phase 3: Burst      │ 1-15 VUs × 1m │ Heavy workload (100K iterations)
                    │               │
Total Duration: ~14 minutes (safe for trial accounts)
```

### Workload Complexity
- **Light**: 10K iterations, basic math operations, 5MB memory, 2 DB queries
- **Moderate**: 50K iterations, trig operations, 20MB memory, 5 DB queries  
- **Heavy**: 100K iterations, complex math, 50MB memory, 10 DB queries

## 🔧 Quick Start

### Run Enhanced Comparison
```bash
./run-comparison.sh
```

### Analyze Results
```bash
python3 analyze-results.py
```

### Manual Testing (Single Endpoint)
```bash
# Light CPU test
curl -X POST https://api.functions.devinsights.site/api/benchmark/cpu \
  -H "Content-Type: application/json" \
  -d '{"iterations": 10000, "complexity": 1}'

# Heavy Memory test  
curl -X POST https://api.kubernetes.devinsights.site/api/benchmark/memory \
  -H "Content-Type: application/json" \
  -d '{"size_mb": 50, "operations": 500}'
```

## 📈 Understanding Results

### Key Metrics

#### Response Times & Resource Usage
```
📊 RESPONSE TIME COMPARISON:
Functions - Avg: 359ms, p95: 1201ms
K8s       - Avg: 712ms, p95: 2759ms

🔥 RESOURCE COMPARISON:
CPU Ops/sec:  Functions   14587902  |  K8s   14717666
Memory Peak:  Functions     12.0MB  |  K8s     12.4MB

🏆 CPU Winner: K8s
🏆 Memory Winner: Functions
```

#### Cost Summary
```
💰 COST SUMMARY:
Test: 1428 requests in 14.2 min
Functions: ~$0.000286 (pay per request)
K8s: ~$0.000234 (always running)
Break-even: ~365M requests/month
```

#### Simple Recommendations
```
🎯 RECOMMENDATION:
✅ Functions: Faster response times
✅ Functions: Low cold start impact

💡 Choose Functions for: Variable traffic, fast responses, easy scaling
💡 Choose K8s for: Consistent traffic, always-warm, full control
```

## 🎯 Decision Framework

### Choose **Azure Functions** if:
- ✅ **Sporadic/unpredictable traffic** (event-driven)
- ✅ **Cost optimization** for low-volume workloads
- ✅ **Minimal ops overhead** desired
- ✅ **Serverless benefits** outweigh cold starts

### Choose **Kubernetes** if:
- ✅ **Consistent traffic patterns**
- ✅ **Predictable performance** required
- ✅ **High-volume applications** (>100K requests/month)
- ✅ **Full infrastructure control** needed

## 🔍 Advanced Analysis

### Performance Patterns
- **K8s typically wins**: CPU efficiency, memory usage, response times
- **Functions advantage**: Zero infrastructure management, event-driven scaling
- **Cold starts**: Major Functions disadvantage for consistent traffic

### Trial Account Considerations
- **Max 15 VUs**: Safe for trial limits
- **17-minute tests**: Won't exceed quota
- **Resource monitoring**: Tracks actual usage vs limits
- **Cost tracking**: Detailed breakdown for budget planning

## 📋 File Guide

| File | Purpose |
|------|---------|
| `functions-vs-k8s-comparison.js` | Main k6 test with enhanced scenarios |
| `analyze-results.py` | Enhanced analysis with cost/efficiency insights |
| `run-comparison.sh` | Test runner with progress indicators |
| `resource-monitor.js` | Utility for resource usage tracking |
| `results/` | Test results with timestamps |

## 🛠️ Troubleshooting

### Common Issues

**Test fails with timeout errors**
```bash
# Increase timeout in test
timeout: '120s'  # Instead of 60s
```

**Out of Azure credits**
```bash
# Check usage
az consumption usage list --top 10
```

**K6 not installed**
```bash
# Install k6
curl https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-linux-amd64.tar.gz -L | tar xvz
```

### Optimizing for Trial Accounts

1. **Reduce VU count** if hitting limits:
   ```javascript
   stages: [
     { duration: '30s', target: 5 },  // Instead of 15
   ```

2. **Shorter test duration**:
   ```javascript
   duration: '1m',  // Instead of 2m
   ```

3. **Lower complexity**:
   ```javascript
   iterations: 5000,  // Instead of 100000
   ```

## 🎓 Learning Resources

- [k6 Documentation](https://k6.io/docs/)
- [Azure Functions Pricing](https://azure.microsoft.com/pricing/details/functions/)
- [AKS Pricing Calculator](https://azure.microsoft.com/pricing/calculator/)
- [Performance Testing Best Practices](https://k6.io/docs/testing-guides/running-distributed-tests/)

## 🤝 Contributing

Found an issue or want to improve the tests? 
1. Test your changes with small workloads first
2. Ensure trial account compatibility 
3. Update both the test and analysis scripts
4. Verify cost calculations are accurate

---

**Ready to test?** Run `./run-comparison.sh` and discover which platform works best for your specific use case! 🚀

