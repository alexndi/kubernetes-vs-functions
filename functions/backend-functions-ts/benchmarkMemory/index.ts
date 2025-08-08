// functions/backend-functions-ts/benchmarkMemory/index.ts
import { AzureFunction, Context, HttpRequest } from "@azure/functions";

let instanceId = `func-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
let requestCount = 0;

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const startTime = Date.now();
  requestCount++;
  
  // Parse parameters
  const size_mb = parseInt(req.query.size_mb || req.body?.size_mb) || 10;
  const operations = parseInt(req.query.operations || req.body?.operations) || 100;
  
  context.log(`Memory Benchmark: ${size_mb}MB with ${operations} operations`);
  
  // Capture initial memory
  const initialMemory = process.memoryUsage();
  
  try {
    const arrays: Buffer[] = [];
    const allocationTimes: number[] = [];
    
    // Allocate memory in chunks
    const chunkSize = 1024 * 1024; // 1MB chunks
    for (let i = 0; i < size_mb; i++) {
      const allocStart = Date.now();
      const buffer = Buffer.alloc(chunkSize);
      
      // Fill with data to ensure allocation
      for (let j = 0; j < buffer.length; j += 1000) {
        buffer[j] = Math.floor(Math.random() * 256);
      }
      
      arrays.push(buffer);
      allocationTimes.push(Date.now() - allocStart);
    }
    
    // Perform operations on allocated memory
    let operationResult = 0;
    const operationStart = Date.now();
    
    for (let op = 0; op < operations; op++) {
      // Random read/write operations
      const arrayIndex = Math.floor(Math.random() * arrays.length);
      const buffer = arrays[arrayIndex];
      const position = Math.floor(Math.random() * buffer.length);
      
      // Write
      buffer[position] = (buffer[position] + 1) % 256;
      
      // Read and accumulate
      operationResult += buffer[position];
      
      // Occasionally do bulk operations
      if (op % 10 === 0) {
        const sum = buffer.reduce((acc, val) => acc + val, 0);
        operationResult += sum % 1000;
      }
    }
    
    const operationDuration = Date.now() - operationStart;
    
    // Measure final memory
    const finalMemory = process.memoryUsage();
    
    // Force garbage collection if available (won't work in production)
    if (global.gc) {
      global.gc();
    }
    
    // Clear arrays
    arrays.length = 0;
    
    // Measure after cleanup
    const cleanedMemory = process.memoryUsage();
    
    const duration = Date.now() - startTime;
    
    const response = {
      test: "memory",
      metrics: {
        duration_ms: duration,
        allocation_time_ms: allocationTimes.reduce((a, b) => a + b, 0),
        operation_time_ms: operationDuration,
        avg_allocation_time_ms: allocationTimes.reduce((a, b) => a + b, 0) / allocationTimes.length,
        size_allocated_mb: size_mb,
        operations_performed: operations,
        memory_usage: {
          initial_heap_mb: Math.round(initialMemory.heapUsed / 1024 / 1024),
          peak_heap_mb: Math.round(finalMemory.heapUsed / 1024 / 1024),
          after_cleanup_heap_mb: Math.round(cleanedMemory.heapUsed / 1024 / 1024),
          heap_growth_mb: Math.round((finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024),
          rss_mb: Math.round(finalMemory.rss / 1024 / 1024)
        }
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
    context.log.error('Memory benchmark failed:', error);
    context.res = {
      status: 500,
      body: {
        error: 'Memory benchmark failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
};

export default httpTrigger;