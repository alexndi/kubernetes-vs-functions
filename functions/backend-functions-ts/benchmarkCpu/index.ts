// functions/backend-functions-ts/benchmarkCpu/index.ts
import { AzureFunction, Context, HttpRequest } from "@azure/functions";

let instanceId = `func-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
let requestCount = 0;

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const startTime = Date.now();
  requestCount++;
  
  // Parse iterations (default: 1 million)
  const iterations = parseInt(req.query.iterations || req.body?.iterations) || 1000000;
  const complexity = parseInt(req.query.complexity || req.body?.complexity) || 1;
  
  context.log(`CPU Benchmark: ${iterations} iterations at complexity ${complexity}`);
  
  try {
    // CPU-intensive calculations
    let result = 0;
    
    for (let i = 0; i < iterations; i++) {
      // Vary complexity based on parameter
      switch (complexity) {
        case 1: // Light
          result += Math.sqrt(i);
          break;
        case 2: // Medium
          result += Math.sqrt(i) * Math.sin(i);
          break;
        case 3: // Heavy
          result += Math.sqrt(i) * Math.sin(i) * Math.cos(i) * Math.tan(i % 90);
          break;
        default:
          result += Math.sqrt(i);
      }
    }
    
    // Calculate prime numbers for additional CPU load
    const primes = [];
    const maxPrime = Math.min(iterations / 100, 10000);
    for (let num = 2; num <= maxPrime; num++) {
      let isPrime = true;
      for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) {
          isPrime = false;
          break;
        }
      }
      if (isPrime) primes.push(num);
    }
    
    const duration = Date.now() - startTime;
    
    const response = {
      test: "cpu",
      metrics: {
        duration_ms: duration,
        iterations: iterations,
        complexity: complexity,
        operations_per_second: Math.round((iterations / duration) * 1000),
        prime_count: primes.length,
        cpu_result: result
      },
      platform: {
        type: "serverless",
        provider: "azure_functions",
        instance_id: instanceId,
        cold_start: requestCount === 1,
        request_number: requestCount
      },
      timestamp: new Date().toISOString()
    };
    
    context.res = {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Instance-ID': instanceId,
        'X-Cold-Start': (requestCount === 1).toString()
      },
      body: response
    };
    
  } catch (error) {
    context.log.error('CPU benchmark failed:', error);
    context.res = {
      status: 500,
      body: {
        error: 'CPU benchmark failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
};

export default httpTrigger;