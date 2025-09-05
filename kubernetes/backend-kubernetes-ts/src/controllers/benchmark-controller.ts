// kubernetes/backend-kubernetes-ts/src/controllers/benchmark-controller.ts
import { Request, Response } from 'express';
import pool from '../config/database';

// Instance tracking
const instanceId = `k8s-${process.env.HOSTNAME || 'unknown'}-${Date.now()}`;
const startupTime = Date.now();
let requestCount = {
  cpu: 0,
  memory: 0,
  latency: 0
};

export class BenchmarkController {
  
  async cpuBenchmark(req: Request, res: Response) {
    const startTime = Date.now();
    requestCount.cpu++;
    
    // Parse parameters
    const iterations = parseInt(req.query.iterations as string || req.body?.iterations) || 1000000;
    const complexity = parseInt(req.query.complexity as string || req.body?.complexity) || 1;
    
    console.log(`CPU Benchmark: ${iterations} iterations at complexity ${complexity}`);
    
    try {
      // CPU-intensive calculations
      let result = 0;
      
      for (let i = 0; i < iterations; i++) {
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
      
      // Calculate prime numbers
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
          type: "kubernetes",
          provider: "aks",
          instance_id: instanceId,
          pod_name: process.env.HOSTNAME || 'unknown',
          node_name: process.env.NODE_NAME || 'unknown',
          cold_start: requestCount.cpu === 1,
          request_number: requestCount.cpu
        },
        timestamp: new Date().toISOString()
      };
      
      res.set({
        'X-Instance-ID': instanceId,
        'X-Pod-Name': process.env.HOSTNAME || 'unknown',
        'X-Cold-Start': (requestCount.cpu === 1).toString()
      });
      
      res.json(response);
      
    } catch (error) {
      console.error('CPU benchmark failed:', error);
      res.status(500).json({
        error: 'CPU benchmark failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  async memoryBenchmark(req: Request, res: Response) {
    const startTime = Date.now();
    requestCount.memory++;
    
    // Parse parameters
    const size_mb = parseInt(req.query.size_mb as string || req.body?.size_mb) || 10;
    const operations = parseInt(req.query.operations as string || req.body?.operations) || 100;
    
    console.log(`Memory Benchmark: ${size_mb}MB with ${operations} operations`);
    
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
        
        // Fill with data
        for (let j = 0; j < buffer.length; j += 1000) {
          buffer[j] = Math.floor(Math.random() * 256);
        }
        
        arrays.push(buffer);
        allocationTimes.push(Date.now() - allocStart);
      }
      
      // Perform operations
      let operationResult = 0;
      const operationStart = Date.now();
      
      for (let op = 0; op < operations; op++) {
        const arrayIndex = Math.floor(Math.random() * arrays.length);
        const buffer = arrays[arrayIndex];
        const position = Math.floor(Math.random() * buffer.length);
        
        buffer[position] = (buffer[position] + 1) % 256;
        operationResult += buffer[position];
        
        if (op % 10 === 0) {
          const sum = buffer.reduce((acc, val) => acc + val, 0);
          operationResult += sum % 1000;
        }
      }
      
      const operationDuration = Date.now() - operationStart;
      
      // Measure final memory
      const finalMemory = process.memoryUsage();
      
      // Clear arrays
      arrays.length = 0;
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
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
          type: "kubernetes",
          provider: "aks",
          instance_id: instanceId,
          pod_name: process.env.HOSTNAME || 'unknown',
          node_name: process.env.NODE_NAME || 'unknown',
          cold_start: requestCount.memory === 1,
          request_number: requestCount.memory
        },
        timestamp: new Date().toISOString()
      };
      
      res.set({
        'X-Instance-ID': instanceId,
        'X-Pod-Name': process.env.HOSTNAME || 'unknown',
        'X-Cold-Start': (requestCount.memory === 1).toString()
      });
      
      res.json(response);
      
    } catch (error) {
      console.error('Memory benchmark failed:', error);
      res.status(500).json({
        error: 'Memory benchmark failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  async latencyBenchmark(req: Request, res: Response) {
    const requestStartTime = Date.now();
    requestCount.latency++;
    
    // Parse parameters
    const db_queries = parseInt(req.query.db_queries as string || req.body?.db_queries) || 5;
    const delay_ms = parseInt(req.query.delay_ms as string || req.body?.delay_ms) || 0;
    const parallel = (req.query.parallel || req.body?.parallel) === 'true';
    
    console.log(`Latency Benchmark: ${db_queries} queries, ${delay_ms}ms delay, parallel: ${parallel}`);
    
    const latencyMetrics = {
      initialization_ms: 0,
      db_connection_ms: 0,
      query_times_ms: [] as number[],
      network_simulation_ms: 0,
      total_db_time_ms: 0
    };
    
    try {
      // Measure initialization
      const initStart = Date.now();
      const isWarm = (Date.now() - startupTime) > 5000 && requestCount.latency > 1;
      latencyMetrics.initialization_ms = Date.now() - initStart;
      
      // Test database latency
      const dbStart = Date.now();
      
      if (parallel) {
        // Parallel queries
        const queries = [];
        for (let i = 0; i < db_queries; i++) {
          queries.push(
            (async () => {
              const queryStart = Date.now();
              try {
                await pool.query(
                  'SELECT id, title, date FROM posts ORDER BY date DESC LIMIT $1 OFFSET $2',
                  [5, i * 5]
                );
              } catch (err) {
                // Fallback
                await new Promise(resolve => setTimeout(resolve, 10));
              }
              return Date.now() - queryStart;
            })()
          );
        }
        
        const times = await Promise.all(queries);
        latencyMetrics.query_times_ms = times;
      } else {
        // Sequential queries
        for (let i = 0; i < db_queries; i++) {
          const queryStart = Date.now();
          try {
            await pool.query(
              'SELECT id, title, date FROM posts ORDER BY date DESC LIMIT $1 OFFSET $2',
              [5, i * 5]
            );
          } catch (err) {
            // Fallback
            await new Promise(resolve => setTimeout(resolve, 10));
          }
          latencyMetrics.query_times_ms.push(Date.now() - queryStart);
        }
      }
      
      latencyMetrics.total_db_time_ms = Date.now() - dbStart;
      
      // Simulate network delay
      if (delay_ms > 0) {
        const delayStart = Date.now();
        await new Promise(resolve => setTimeout(resolve, delay_ms));
        latencyMetrics.network_simulation_ms = Date.now() - delayStart;
      }
      
      const totalDuration = Date.now() - requestStartTime;
      
      // Calculate statistics
      const queryTimes = latencyMetrics.query_times_ms;
      const avgQueryTime = queryTimes.length > 0 
        ? queryTimes.reduce((a, b) => a + b, 0) / queryTimes.length 
        : 0;
      const minQueryTime = queryTimes.length > 0 ? Math.min(...queryTimes) : 0;
      const maxQueryTime = queryTimes.length > 0 ? Math.max(...queryTimes) : 0;
      
      const response = {
        test: "latency",
        metrics: {
          total_duration_ms: totalDuration,
          initialization_ms: latencyMetrics.initialization_ms,
          db_total_ms: latencyMetrics.total_db_time_ms,
          network_delay_ms: latencyMetrics.network_simulation_ms,
          query_count: db_queries,
          query_execution_mode: parallel ? "parallel" : "sequential",
          query_stats: {
            avg_ms: Math.round(avgQueryTime),
            min_ms: minQueryTime,
            max_ms: maxQueryTime,
            all_queries_ms: queryTimes
          },
          overhead_ms: totalDuration - latencyMetrics.total_db_time_ms - latencyMetrics.network_simulation_ms
        },
        platform: {
          type: "kubernetes",
          provider: "aks",
          instance_id: instanceId,
          pod_name: process.env.HOSTNAME || 'unknown',
          node_name: process.env.NODE_NAME || 'unknown',
          cold_start: requestCount.latency === 1,
          warm_instance: isWarm,
          request_number: requestCount.latency,
          instance_age_ms: Date.now() - startupTime
        },
        timestamp: new Date().toISOString()
      };
      
      res.set({
        'X-Instance-ID': instanceId,
        'X-Pod-Name': process.env.HOSTNAME || 'unknown',
        'X-Cold-Start': (requestCount.latency === 1).toString(),
        'X-Total-Latency': totalDuration.toString()
      });
      
      res.json(response);
      
    } catch (error) {
      console.error('Latency benchmark failed:', error);
      res.status(500).json({
        error: 'Latency benchmark failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default BenchmarkController;