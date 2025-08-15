// k6-tests/simple-test.js - Simple endpoint verification
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '10s', target: 1 },   // Just 1 user for 10 seconds
  ],
  thresholds: {
    http_req_duration: ['p(95)<30000'], // 30s timeout (generous)
    errors: ['rate<0.5'],               // Allow up to 50% errors for testing
  },
};

const ENV = __ENV.TEST_ENV || 'serverless';
const BASE_URL = ENV === 'serverless' 
  ? 'https://func-nbu-blog-api.azurewebsites.net'
  : 'https://devinsights.site';

export default function() {
  console.log(`Testing ${ENV} environment: ${BASE_URL}`);
  
  // Test 1: CPU Benchmark (very light)
  console.log('🔥 Testing CPU benchmark...');
  const cpuRes = http.post(`${BASE_URL}/api/benchmark/cpu`, JSON.stringify({
    iterations: 1000,    // Very low - just 1K iterations
    complexity: 1        // Lightest complexity
  }), {
    headers: { 'Content-Type': 'application/json' },
    timeout: '30s'
  });
  
  const cpuSuccess = check(cpuRes, {
    'CPU: status 200': (r) => r.status === 200,
    'CPU: has duration': (r) => {
      const body = r.json();
      return body && body.metrics && body.metrics.duration_ms !== undefined;
    }
  });
  
  errorRate.add(!cpuSuccess);
  
  if (cpuRes.status === 200) {
    const body = cpuRes.json();
    console.log(`✅ CPU Test: ${body.metrics.duration_ms}ms, ${body.metrics.operations_per_second} ops/sec`);
  } else {
    console.log(`❌ CPU Test failed: ${cpuRes.status}`);
  }
  
  sleep(2); // Short pause
  
  // Test 2: Memory Benchmark (very light)
  console.log('💾 Testing Memory benchmark...');
  const memRes = http.post(`${BASE_URL}/api/benchmark/memory`, JSON.stringify({
    size_mb: 1,         // Just 1MB
    operations: 10      // Only 10 operations
  }), {
    headers: { 'Content-Type': 'application/json' },
    timeout: '30s'
  });
  
  const memSuccess = check(memRes, {
    'Memory: status 200': (r) => r.status === 200,
    'Memory: has heap info': (r) => {
      const body = r.json();
      return body && body.metrics && body.metrics.memory_usage !== undefined;
    }
  });
  
  errorRate.add(!memSuccess);
  
  if (memRes.status === 200) {
    const body = memRes.json();
    console.log(`✅ Memory Test: ${body.metrics.duration_ms}ms, Peak: ${body.metrics.memory_usage.peak_heap_mb}MB`);
  } else {
    console.log(`❌ Memory Test failed: ${memRes.status}`);
  }
  
  sleep(2); // Short pause
  
  // Test 3: Latency Benchmark (very light)
  console.log('⚡ Testing Latency benchmark...');
  const latRes = http.post(`${BASE_URL}/api/benchmark/latency`, JSON.stringify({
    db_queries: 1,      // Just 1 query
    delay_ms: 0,        // No artificial delay
    parallel: false     // Sequential (simpler)
  }), {
    headers: { 'Content-Type': 'application/json' },
    timeout: '30s'
  });
  
  const latSuccess = check(latRes, {
    'Latency: status 200': (r) => r.status === 200,
    'Latency: has timing': (r) => {
      const body = r.json();
      return body && body.metrics && body.metrics.total_duration_ms !== undefined;
    }
  });
  
  errorRate.add(!latSuccess);
  
  if (latRes.status === 200) {
    const body = latRes.json();
    console.log(`✅ Latency Test: ${body.metrics.total_duration_ms}ms total, DB: ${body.metrics.db_total_ms}ms`);
    if (body.platform && body.platform.cold_start) {
      console.log(`❄️ Cold start detected!`);
    }
  } else {
    console.log(`❌ Latency Test failed: ${latRes.status}`);
  }
  
  sleep(3); // Longer pause between iterations
}
