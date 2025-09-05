// k6-tests/functions-vs-k8s-comparison.js
// Enhanced comparison test for Azure Functions vs Kubernetes
// Progressive load testing suitable for trial accounts with better resource monitoring
import { group, check, sleep } from 'k6';
import http from 'k6/http';
import { Rate, Counter, Trend } from 'k6/metrics';

// Enhanced custom metrics for better comparison
const errorRate = new Rate('errors');
const functionsColdStarts = new Counter('functions_cold_starts');
const functionsDuration = new Trend('functions_duration');
const k8sDuration = new Trend('k8s_duration');
const functionsOpsPerSecond = new Trend('functions_ops_per_second');
const k8sOpsPerSecond = new Trend('k8s_ops_per_second');
const functionsMemoryPeak = new Trend('functions_memory_peak_mb');
const k8sMemoryPeak = new Trend('k8s_memory_peak_mb');
const functionsMemoryGrowth = new Trend('functions_memory_growth_mb');
const k8sMemoryGrowth = new Trend('k8s_memory_growth_mb');

export const options = {
  scenarios: {
    // Progressive load testing - simplified without warmup
    functions_light: {
      executor: 'ramping-vus',
      exec: 'testFunctions', 
      startVUs: 1,
      stages: [
        { duration: '30s', target: 3 },  // Ramp up to 3 VUs
        { duration: '1m', target: 3 },   // Stay at 3 VUs
        { duration: '30s', target: 1 }   // Ramp down
      ],
      startTime: '0s',
      tags: { platform: 'functions', phase: 'light' }
    },
    functions_moderate: {
      executor: 'ramping-vus',
      exec: 'testFunctions',
      startVUs: 1,
      stages: [
        { duration: '30s', target: 8 },   // Ramp up to 8 VUs
        { duration: '1m', target: 8 },    // Stay at 8 VUs  
        { duration: '30s', target: 1 }    // Ramp down
      ],
      startTime: '2m30s',
      tags: { platform: 'functions', phase: 'moderate' }
    },
    functions_burst: {
      executor: 'ramping-vus',
      exec: 'testFunctions',
      startVUs: 1,
      stages: [
        { duration: '15s', target: 15 },  // Quick burst to 15 VUs
        { duration: '30s', target: 15 },  // Short burst duration
        { duration: '15s', target: 1 }    // Quick ramp down
      ],
      startTime: '5m30s',
      tags: { platform: 'functions', phase: 'burst' }
    },
    
    // Kubernetes tests - same progressive pattern but offset
    k8s_light: {
      executor: 'ramping-vus',
      exec: 'testKubernetes',
      startVUs: 1,
      stages: [
        { duration: '30s', target: 3 },
        { duration: '1m', target: 3 },
        { duration: '30s', target: 1 }
      ],
      startTime: '7m',
      tags: { platform: 'k8s', phase: 'light' }
    },
    k8s_moderate: {
      executor: 'ramping-vus',
      exec: 'testKubernetes',
      startVUs: 1,
      stages: [
        { duration: '30s', target: 8 },
        { duration: '1m', target: 8 },
        { duration: '30s', target: 1 }
      ],
      startTime: '9m30s',
      tags: { platform: 'k8s', phase: 'moderate' }
    },
    k8s_burst: {
      executor: 'ramping-vus',
      exec: 'testKubernetes',
      startVUs: 1,
      stages: [
        { duration: '15s', target: 15 },
        { duration: '30s', target: 15 },
        { duration: '15s', target: 1 }
      ],
      startTime: '12m30s',
      tags: { platform: 'k8s', phase: 'burst' }
    }
  },
  thresholds: {
    'http_req_duration{platform:functions}': ['p(95)<30000'],
    'http_req_duration{platform:k8s}': ['p(95)<15000'],
    'errors': ['rate<0.05'], // Less than 5% error rate
    'functions_ops_per_second': ['avg>50'], // Minimum performance expectation
    'k8s_ops_per_second': ['avg>100']
  }
};

const FUNCTIONS_URL = 'https://api.functions.devinsights.site';
const K8S_URL = 'https://api.kubernetes.devinsights.site';

// Get current VU count to determine test complexity
function getCurrentComplexity() {
  const vus = __VU;  
  if (vus <= 3) return { level: 1, name: 'light' };
  if (vus <= 8) return { level: 2, name: 'moderate' };
  return { level: 3, name: 'heavy' };
}

function runBenchmarkSuite(baseUrl, platform) {
  const complexity = getCurrentComplexity();
  console.log(`\n🧪 Testing ${platform} (${complexity.name}): ${baseUrl} [VU=${__VU}]`);
  
  // CPU Benchmark - Progressive complexity based on load
  group(`${platform}: CPU Test (${complexity.name})`, () => {
    console.log(`🔥 CPU benchmark on ${platform} - ${complexity.name} load...`);
    const startTime = Date.now();
    
    // Adjust test parameters based on complexity
    const testParams = {
      light: { iterations: 10000, complexity: 1 },
      moderate: { iterations: 50000, complexity: 2 }, 
      heavy: { iterations: 100000, complexity: 3 }
    };
    
    const params = testParams[complexity.name];
    
    const cpuRes = http.post(`${baseUrl}/api/benchmark/cpu`, JSON.stringify(params), {
      headers: { 'Content-Type': 'application/json' },
      timeout: '60s',
      tags: { test: 'cpu', platform: platform, complexity: complexity.name }
    });
    
    const duration = Date.now() - startTime;
    
    const success = check(cpuRes, {
      [`${platform} CPU: status 200`]: (r) => r.status === 200,
      [`${platform} CPU: has metrics`]: (r) => {
        try {
          const body = r.json();
          return body && body.metrics && body.metrics.duration_ms !== undefined;
        } catch (e) {
          return false;
        }
      }
    });
    
    errorRate.add(!success);
    
    if (platform === 'functions') {
      functionsDuration.add(duration);
    } else {
      k8sDuration.add(duration);
    }
    
    if (cpuRes.status === 200) {
      try {
        const body = cpuRes.json();
        const opsPerSec = body.metrics.operations_per_second || 0;
        const durationMs = body.metrics.duration_ms;
        
        console.log(`✅ ${platform} CPU: ${durationMs}ms, ${opsPerSec} ops/sec`);
        
        // Track detailed metrics
        if (platform === 'functions') {
          functionsOpsPerSecond.add(opsPerSec);
        } else {
          k8sOpsPerSecond.add(opsPerSec);
        }
        
        // Track cold starts for Functions
        if (platform === 'functions' && body.platform && body.platform.cold_start) {
          console.log(`❄️  Functions cold start detected! (Request #${body.platform.request_number})`);
          functionsColdStarts.add(1);
        }
      } catch (e) {
        console.log(`✅ ${platform} CPU: Response received but couldn't parse metrics`);
      }
    } else {
      console.log(`❌ ${platform} CPU test failed: ${cpuRes.status}`);
    }
  });
  
  sleep(2); // Shorter pause for more realistic testing
  
  // Memory Benchmark - Progressive load
  group(`${platform}: Memory Test (${complexity.name})`, () => {
    console.log(`💾 Memory benchmark on ${platform} - ${complexity.name} load...`);
    
    // Adjust memory test parameters
    const memParams = {
      light: { size_mb: 5, operations: 50 },
      moderate: { size_mb: 20, operations: 200 },
      heavy: { size_mb: 50, operations: 500 }
    };
    
    const params = memParams[complexity.name];
    
    const memRes = http.post(`${baseUrl}/api/benchmark/memory`, JSON.stringify(params), {
      headers: { 'Content-Type': 'application/json' },
      timeout: '60s',
      tags: { test: 'memory', platform: platform, complexity: complexity.name }
    });
    
    const success = check(memRes, {
      [`${platform} Memory: status 200`]: (r) => r.status === 200,
      [`${platform} Memory: has metrics`]: (r) => {
        try {
          const body = r.json();
          return body && body.metrics && body.metrics.memory_usage !== undefined;
        } catch (e) {
          return false;
        }
      }
    });
    
    errorRate.add(!success);
    
    if (memRes.status === 200) {
      try {
        const body = memRes.json();
        const memUsage = body.metrics.memory_usage;
        const durationMs = body.metrics.duration_ms;
        
        console.log(`✅ ${platform} Memory: ${durationMs}ms, Peak: ${memUsage.peak_heap_mb}MB`);
        
        // Track detailed memory metrics
        if (platform === 'functions') {
          functionsMemoryPeak.add(memUsage.peak_heap_mb);
          functionsMemoryGrowth.add(memUsage.heap_growth_mb);
        } else {
          k8sMemoryPeak.add(memUsage.peak_heap_mb);
          k8sMemoryGrowth.add(memUsage.heap_growth_mb);
        }
        
        // Cold start tracking
        if (platform === 'functions' && body.platform && body.platform.cold_start) {
          console.log(`❄️  Functions cold start in memory test! (Request #${body.platform.request_number})`);
          functionsColdStarts.add(1);
        }
      } catch (e) {
        console.log(`✅ ${platform} Memory: Response received but couldn't parse metrics`);
      }
    } else {
      console.log(`❌ ${platform} Memory test failed: ${memRes.status}`);
    }
  });
  
  sleep(2); 
  
  // Latency Benchmark - Progressive database load
  group(`${platform}: Latency Test (${complexity.name})`, () => {
    console.log(`⚡ Latency benchmark on ${platform} - ${complexity.name} load...`);
    
    // Adjust latency test parameters
    const latParams = {
      light: { db_queries: 2, delay_ms: 0, parallel: false },
      moderate: { db_queries: 5, delay_ms: 10, parallel: true },
      heavy: { db_queries: 10, delay_ms: 25, parallel: true }
    };
    
    const params = latParams[complexity.name];
    
    const latRes = http.post(`${baseUrl}/api/benchmark/latency`, JSON.stringify(params), {
      headers: { 'Content-Type': 'application/json' },
      timeout: '60s',
      tags: { test: 'latency', platform: platform, complexity: complexity.name }
    });
    
    const success = check(latRes, {
      [`${platform} Latency: status 200`]: (r) => r.status === 200,
      [`${platform} Latency: has metrics`]: (r) => {
        try {
          const body = r.json();
          return body && body.metrics && body.metrics.total_duration_ms !== undefined;
        } catch (e) {
          return false;
        }
      }
    });
    
    errorRate.add(!success);
    
    if (latRes.status === 200) {
      try {
        const body = latRes.json();
        const totalMs = body.metrics.total_duration_ms;
        const dbMs = body.metrics.db_total_ms;
        const queries = params.db_queries;
        
        console.log(`✅ ${platform} Latency: ${totalMs}ms total, DB: ${dbMs}ms`);
        
        // Cold start tracking  
        if (platform === 'functions' && body.platform && body.platform.cold_start) {
          console.log(`❄️  Functions cold start in latency test! (Request #${body.platform.request_number})`);
          functionsColdStarts.add(1);
        }
      } catch (e) {
        console.log(`✅ ${platform} Latency: Response received but couldn't parse metrics`);
      }
    } else {
      console.log(`❌ ${platform} Latency test failed: ${latRes.status}`);
    }
  });
  
  sleep(1); // Shorter pause for more realistic flow
}

export function testFunctions() {
  runBenchmarkSuite(FUNCTIONS_URL, 'functions');
}

export function testKubernetes() {
  runBenchmarkSuite(K8S_URL, 'k8s');
}

export function handleSummary(data) {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 ENHANCED FUNCTIONS VS KUBERNETES COMPARISON SUMMARY');
  console.log('='.repeat(80));
  
  // Extract key metrics for comparison
  const functionsMetrics = data.metrics['http_req_duration{platform:functions}'];
  const k8sMetrics = data.metrics['http_req_duration{platform:k8s}'];
  
  // Response Time Analysis
  if (functionsMetrics && k8sMetrics) {
    console.log('\n📊 RESPONSE TIME COMPARISON:');
    console.log('-'.repeat(50));
    console.log(`Functions - Avg: ${functionsMetrics.values.avg.toFixed(2)}ms, p95: ${functionsMetrics.values['p(95)'].toFixed(2)}ms`);
    console.log(`K8s       - Avg: ${k8sMetrics.values.avg.toFixed(2)}ms, p95: ${k8sMetrics.values['p(95)'].toFixed(2)}ms`);
    
    const avgImprovement = ((functionsMetrics.values.avg - k8sMetrics.values.avg) / functionsMetrics.values.avg * 100);
    const p95Improvement = ((functionsMetrics.values['p(95)'] - k8sMetrics.values['p(95)']) / functionsMetrics.values['p(95)'] * 100);
    
    console.log(`\n🏆 Performance Winner:`);
    console.log(`Average: K8s is ${Math.abs(avgImprovement).toFixed(1)}% ${avgImprovement > 0 ? 'faster' : 'slower'} than Functions`);
    console.log(`p95: K8s is ${Math.abs(p95Improvement).toFixed(1)}% ${p95Improvement > 0 ? 'faster' : 'slower'} than Functions`);
  }
  
  // CPU Performance Analysis
  const funcOps = data.metrics.functions_ops_per_second;
  const k8sOps = data.metrics.k8s_ops_per_second;
  
  if (funcOps && k8sOps) {
    console.log('\n🔥 CPU PERFORMANCE COMPARISON:');
    console.log('-'.repeat(50));
    console.log(`Functions - Avg: ${funcOps.values.avg.toFixed(0)} ops/sec, Max: ${funcOps.values.max.toFixed(0)}`);
    console.log(`K8s       - Avg: ${k8sOps.values.avg.toFixed(0)} ops/sec, Max: ${k8sOps.values.max.toFixed(0)}`);
    
    const cpuImprovement = ((k8sOps.values.avg - funcOps.values.avg) / funcOps.values.avg * 100);
    console.log(`CPU Efficiency: K8s is ${Math.abs(cpuImprovement).toFixed(1)}% ${cpuImprovement > 0 ? 'more efficient' : 'less efficient'} than Functions`);
  }
  
  // Memory Usage Analysis
  const funcMemPeak = data.metrics.functions_memory_peak_mb;
  const k8sMemPeak = data.metrics.k8s_memory_peak_mb;
  const funcMemGrowth = data.metrics.functions_memory_growth_mb;
  const k8sMemGrowth = data.metrics.k8s_memory_growth_mb;
  
  if (funcMemPeak && k8sMemPeak) {
    console.log('\n💾 MEMORY USAGE COMPARISON:');
    console.log('-'.repeat(50));
    console.log(`Functions Peak - Avg: ${funcMemPeak.values.avg.toFixed(1)}MB, Max: ${funcMemPeak.values.max.toFixed(1)}MB`);
    console.log(`K8s Peak       - Avg: ${k8sMemPeak.values.avg.toFixed(1)}MB, Max: ${k8sMemPeak.values.max.toFixed(1)}MB`);
    
    if (funcMemGrowth && k8sMemGrowth) {
      console.log(`Functions Growth - Avg: ${funcMemGrowth.values.avg.toFixed(1)}MB`);
      console.log(`K8s Growth       - Avg: ${k8sMemGrowth.values.avg.toFixed(1)}MB`);
      
      const memEfficiency = ((funcMemPeak.values.avg - k8sMemPeak.values.avg) / funcMemPeak.values.avg * 100);
      console.log(`Memory Efficiency: K8s uses ${Math.abs(memEfficiency).toFixed(1)}% ${memEfficiency > 0 ? 'less' : 'more'} memory than Functions`);
    }
  }
  
  // Cold Start Analysis
  const coldStarts = data.metrics.functions_cold_starts;
  if (coldStarts) {
    const totalFunctionRequests = data.metrics['http_reqs{platform:functions}'] ? 
      data.metrics['http_reqs{platform:functions}'].values.count : 0;
    const coldStartRate = totalFunctionRequests > 0 ? 
      (coldStarts.values.count / totalFunctionRequests * 100) : 0;
      
    console.log('\n❄️  COLD START ANALYSIS:');
    console.log('-'.repeat(50));
    console.log(`Total Cold Starts: ${coldStarts.values.count}`);
    console.log(`Cold Start Rate: ${coldStartRate.toFixed(1)}% of Function requests`);
    console.log(`K8s Cold Starts: 0 (always warm)`);
  }
  
  // Load Testing Summary
  console.log('\n📈 LOAD TESTING PHASES COMPLETED:');
  console.log('-'.repeat(50));
  console.log(`• Light Load: 1-3 VUs ramping (10K iterations)`);
  console.log(`• Moderate Load: 1-8 VUs ramping (50K iterations)`);
  console.log(`• Burst Load: 1-15 VUs quick burst (100K iterations)`);
  
  // Error Analysis
  const errorRate = data.metrics.errors;
  if (errorRate) {
    console.log('\n🔍 RELIABILITY ANALYSIS:');
    console.log('-'.repeat(50));
    console.log(`Overall Error Rate: ${(errorRate.values.rate * 100).toFixed(2)}%`);
    console.log(`Reliability: ${errorRate.values.rate < 0.01 ? '🟢 Excellent' : errorRate.values.rate < 0.05 ? '🟡 Good' : '🔴 Needs Attention'}`);
  }
  
  // Resource Efficiency Summary
  if (funcOps && k8sOps && funcMemPeak && k8sMemPeak) {
    console.log('\n🎯 OVERALL EFFICIENCY VERDICT:');
    console.log('-'.repeat(50));
    
    const cpuWinner = k8sOps.values.avg > funcOps.values.avg ? 'K8s' : 'Functions';
    const memWinner = k8sMemPeak.values.avg < funcMemPeak.values.avg ? 'K8s' : 'Functions';
    const speedWinner = k8sMetrics && functionsMetrics && 
      k8sMetrics.values.avg < functionsMetrics.values.avg ? 'K8s' : 'Functions';
    
    console.log(`🔥 CPU Performance Winner: ${cpuWinner}`);
    console.log(`💾 Memory Efficiency Winner: ${memWinner}`);
    console.log(`⚡ Speed Winner: ${speedWinner}`);
    console.log(`❄️  Cold Start Advantage: K8s (always warm)`);
  }
  
  // Trial Account Insights
  console.log('\n💰 TRIAL ACCOUNT CONSIDERATIONS:');
  console.log('-'.repeat(50));
  console.log(`• This test used progressive load (max 15 VUs for 30s)`);
  console.log(`• Kubernetes: Fixed costs but always running`);
  console.log(`• Functions: Pay-per-execution + cold start delays`);
  console.log(`• Recommendation: Review cost per request in Azure Portal`);
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ ENHANCED COMPARISON COMPLETE - Check results/ for detailed JSON');
  console.log('='.repeat(80) + '\n');
  
  return {
    'summary.json': JSON.stringify(data, null, 2),
  };
}
