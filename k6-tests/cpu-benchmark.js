// k6-tests/cpu-benchmark.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const cpuDuration = new Trend('cpu_duration_ms');
const operationsPerSecond = new Trend('operations_per_second');

export const options = {
  stages: [
    { duration: '30s', target: 1 },   // Warm-up
    { duration: '2m', target: 3 },    // Test with 3 VUs
    { duration: '30s', target: 0 },   // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<10000'], // 95% under 10s
    errors: ['rate<0.1'],                // Less than 10% errors
  },
};

const ENV = __ENV.TEST_ENV || 'serverless';
const BASE_URL = ENV === 'serverless' 
  ? 'https://func-nbu-blog-api.azurewebsites.net'
  : 'https://devinsights.site';

export default function() {
  // Test different complexity levels
  const complexity = Math.floor(Math.random() * 3) + 1;
  const iterations = complexity === 1 ? 1000000 : complexity === 2 ? 500000 : 250000;
  
  const params = {
    iterations: iterations,
    complexity: complexity
  };
  
  const res = http.post(
    `${BASE_URL}/api/benchmark/cpu`,
    JSON.stringify(params),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { 
        environment: ENV,
        complexity: complexity.toString()
      },
      timeout: '30s'
    }
  );
  
  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'has metrics': (r) => {
      const body = r.json();
      return body && body.metrics !== undefined;
    },
    'completed computation': (r) => {
      const body = r.json();
      return body && body.metrics && body.metrics.cpu_result !== undefined;
    }
  });
  
  errorRate.add(!success);
  
  if (res.status === 200 && res.body) {
    try {
      const body = res.json();
      if (body.metrics) {
        cpuDuration.add(body.metrics.duration_ms);
        operationsPerSecond.add(body.metrics.operations_per_second);
        
        console.log(`CPU Test - Complexity: ${complexity}, Duration: ${body.metrics.duration_ms}ms, Ops/sec: ${body.metrics.operations_per_second}`);
      }
    } catch (e) {
      console.error('Failed to parse response:', e);
    }
  }
  
  sleep(2); // 2 seconds between requests
}