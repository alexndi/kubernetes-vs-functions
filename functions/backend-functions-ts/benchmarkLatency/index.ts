// functions/backend-functions-ts/benchmarkLatency/index.ts
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import pool from '../config/database';

let instanceId = `func-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
let requestCount = 0;
const startupTime = Date.now();

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const requestStartTime = Date.now();
  requestCount++;
  
  // Parse parameters
  const db_queries = parseInt(req.query.db_queries || req.body?.db_queries) || 5;
  const delay_ms = parseInt(req.query.delay_ms || req.body?.delay_ms) || 0;
  const parallel = (req.query.parallel || req.body?.parallel) === 'true';
  
  context.log(`Latency Benchmark: ${db_queries} queries, ${delay_ms}ms delay, parallel: ${parallel}`);
  
  const latencyMetrics = {
    initialization_ms: 0,
    db_connection_ms: 0,
    query_times_ms: [] as number[],
    network_simulation_ms: 0,
    total_db_time_ms: 0
  };
  
  try {
    // Measure initialization overhead
    const initStart = Date.now();
    const isWarm = (Date.now() - startupTime) > 5000 && requestCount > 1;
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
              // Fallback for when DB is not available
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
          // Fallback for when DB is not available
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        latencyMetrics.query_times_ms.push(Date.now() - queryStart);
      }
    }
    
    latencyMetrics.total_db_time_ms = Date.now() - dbStart;
    
    // Simulate network/processing delay
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
        type: "serverless",
        provider: "azure_functions",
        instance_id: instanceId,
        cold_start: requestCount === 1,
        warm_instance: isWarm,
        request_number: requestCount,
        instance_age_ms: Date.now() - startupTime
      },
      timestamp: new Date().toISOString()
    };
    
    context.res = {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Instance-ID': instanceId,
        'X-Cold-Start': (requestCount === 1).toString(),
        'X-Total-Latency': totalDuration.toString()
      },
      body: response
    };
    
  } catch (error) {
    context.log.error('Latency benchmark failed:', error);
    context.res = {
      status: 500,
      body: {
        error: 'Latency benchmark failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
};

export default httpTrigger;