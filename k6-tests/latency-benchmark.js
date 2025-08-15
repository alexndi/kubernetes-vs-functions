// k6-tests/latency-benchmark.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const totalLatency = new Trend('total_latency_ms');
const dbLatency = new Trend('db_latency_ms');
const overheadLatency = new Trend('overhead_latency_ms');
const coldStarts = new Rate('cold_starts');

export const options = {
  stages: [
    { duration: '30s', target: 1 },   // Warm-up
    { duration: '3m', target: 5 },    // Test with 5 VUs
    { duration: '30s', target: 0 },   // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% under 3s
    errors: ['rate<0.1'],               // Less than 10% errors
  },
};

const ENV = __ENV.TEST_ENV || 'serverless';
const BASE_URL = ENV === 'serverless' 
  ? 'https://func-nbu-blog-api.azurewebsites.net'
  : 'https://devinsights.site';

export default function() {
  // Vary test parameters
  const testConfigs = [
    { db_queries: 1, delay_ms: 0, parallel: false },
    { db_queries: 3, delay_ms: 10, parallel: false },
    { db_queries: 5, delay_ms: 0, parallel: true },
    { db_queries: 10, delay_ms: 5, parallel: true }
  ];
  
  const config = testConfigs[Math.floor(Math.random() * testConfigs.length)];
  
  const res = http.post(
    `${BASE_URL}/api/benchmark/latency`,
    JSON.stringify(config),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { 
        environment: ENV,
        parallel: config.parallel.toString(),
        queries: config.db_queries.toString()
      },
      timeout: '10s'
    }
  );
  
  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'has latency metrics': (r) => {
      const body = r.json();
      return body && body.metrics && body.metrics.total_duration_ms !== undefined;
    },
    'queries executed': (r) => {
      const body = r.json();
      return body && body.metrics && body.metrics.query_count === config.db_queries;
    }
  });
  
  errorRate.add(!success);
  
  if (res.status === 200 && res.body) {
    try {
      const body = res.json();
      if (body.metrics) {
        totalLatency.add(body.metrics.total_duration_ms);
        dbLatency.add(body.metrics.db_total_ms);
        overheadLatency.add(body.metrics.overhead_ms);
        
        if (body.platform && body.platform.cold_start) {
          coldStarts.add(1);
          console.log(`🧊 Cold Start Detected! Total: ${body.metrics.total_duration_ms}ms`);
        } else {
          coldStarts.add(0);
        }
        
        console.log(`Latency Test - Queries: ${config.db_queries}, Mode: ${config.parallel ? 'parallel' : 'sequential'}, Total: ${body.metrics.total_duration_ms}ms, DB: ${body.metrics.db_total_ms}ms`);
      }
    } catch (e) {
      console.error('Failed to parse response:', e);
    }
  }
  
  sleep(1); // 1 second between requests
}