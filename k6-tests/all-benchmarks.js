// k6-tests/all-benchmarks.js
import { group } from 'k6';
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    cpu_test: {
      executor: 'constant-vus',
      exec: 'cpuTest',
      vus: 2,
      duration: '1m',
      startTime: '0s',
      tags: { test_type: 'cpu' }
    },
    memory_test: {
      executor: 'constant-vus',
      exec: 'memoryTest',
      vus: 1,
      duration: '1m',
      startTime: '1m30s',
      tags: { test_type: 'memory' }
    },
    latency_test: {
      executor: 'constant-vus',
      exec: 'latencyTest',
      vus: 3,
      duration: '1m',
      startTime: '3m',
      tags: { test_type: 'latency' }
    }
  },
  thresholds: {
    'http_req_duration{test_type:cpu}': ['p(95)<10000'],
    'http_req_duration{test_type:memory}': ['p(95)<15000'],
    'http_req_duration{test_type:latency}': ['p(95)<3000'],
  }
};

const ENV = __ENV.TEST_ENV || 'serverless';
const BASE_URL = ENV === 'serverless' 
  ? 'https://func-nbu-blog-api.azurewebsites.net'
  : 'https://devinsights.site';

export function cpuTest() {
  const res = http.post(`${BASE_URL}/api/benchmark/cpu`, JSON.stringify({
    iterations: 500000,
    complexity: 2
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  check(res, { 'cpu status 200': (r) => r.status === 200 });
  sleep(2);
}

export function memoryTest() {
  const res = http.post(`${BASE_URL}/api/benchmark/memory`, JSON.stringify({
    size_mb: 10,
    operations: 100
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  check(res, { 'memory status 200': (r) => r.status === 200 });
  sleep(3);
}

export function latencyTest() {
  const res = http.post(`${BASE_URL}/api/benchmark/latency`, JSON.stringify({
    db_queries: 3,
    delay_ms: 10,
    parallel: true
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  check(res, { 'latency status 200': (r) => r.status === 200 });
  sleep(1);
}