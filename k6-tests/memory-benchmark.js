// k6-tests/memory-benchmark.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Gauge } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const memoryDuration = new Trend('memory_duration_ms');
const heapUsage = Gauge('heap_usage_mb');
const allocationTime = new Trend('allocation_time_ms');

export const options = {
  stages: [
    { duration: '30s', target: 1 },   // Warm-up
    { duration: '2m', target: 2 },    // Test with 2 VUs (memory intensive)
    { duration: '30s', target: 0 },   // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<15000'], // 95% under 15s
    errors: ['rate<0.1'],                // Less than 10% errors
  },
};

const ENV = __ENV.TEST_ENV || 'serverless';
const BASE_URL = ENV === 'serverless' 
  ? 'https://func-nbu-blog-api.azurewebsites.net'
  : 'https://devinsights.site';

export default function() {
  // Test different memory sizes
  const sizes = [5, 10, 20, 50];
  const size_mb = sizes[Math.floor(Math.random() * sizes.length)];
  
  const params = {
    size_mb: size_mb,
    operations: 100
  };
  
  const res = http.post(
    `${BASE_URL}/api/benchmark/memory`,
    JSON.stringify(params),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { 
        environment: ENV,
        size_mb: size_mb.toString()
      },
      timeout: '30s'
    }
  );
  
  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'has memory metrics': (r) => {
      const body = r.json();
      return body && body.metrics && body.metrics.memory_usage !== undefined;
    },
    'allocated memory': (r) => {
      const body = r.json();
      return body && body.metrics && body.metrics.size_allocated_mb === size_mb;
    }
  });
  
  errorRate.add(!success);
  
  if (res.status === 200 && res.body) {
    try {
      const body = res.json();
      if (body.metrics) {
        memoryDuration.add(body.metrics.duration_ms);
        allocationTime.add(body.metrics.allocation_time_ms);
        heapUsage.add(body.metrics.memory_usage.peak_heap_mb);
        
        console.log(`Memory Test - Size: ${size_mb}MB, Duration: ${body.metrics.duration_ms}ms, Peak Heap: ${body.metrics.memory_usage.peak_heap_mb}MB`);
      }
    } catch (e) {
      console.error('Failed to parse response:', e);
    }
  }
  
  sleep(3); // 3 seconds between requests (give time for GC)
}