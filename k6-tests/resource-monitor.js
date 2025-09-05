// k6-tests/resource-monitor.js
// Resource monitoring utility for enhanced testing
import { group, check } from 'k6';
import http from 'k6/http';

/**
 * Collect resource usage statistics from platform endpoints
 * Helps compare actual resource consumption beyond just response times
 */
export function collectResourceStats(baseUrl, platform, testName) {
  return group(`${platform}: Resource Monitoring (${testName})`, () => {
    // Get current resource usage snapshot
    const resourceRes = http.get(`${baseUrl}/health`, {
      headers: { 'Accept': 'application/json' },
      timeout: '10s',
      tags: { 
        test: 'resource_monitor', 
        platform: platform,
        phase: testName
      }
    });

    const success = check(resourceRes, {
      [`${platform} Resource Monitor: status 200`]: (r) => r.status === 200,
      [`${platform} Resource Monitor: has data`]: (r) => {
        try {
          const body = r.json();
          return body && body.status === 'ok';
        } catch (e) {
          return false;
        }
      }
    });

    if (resourceRes.status === 200) {
      try {
        const body = resourceRes.json();
        console.log(`📊 ${platform} Resource Status (${testName}): ${JSON.stringify(body, null, 2)}`);
        return {
          platform: platform,
          testName: testName,
          timestamp: new Date().toISOString(),
          data: body
        };
      } catch (e) {
        console.log(`⚠️  ${platform} Resource Monitor: Could not parse response`);
        return null;
      }
    } else {
      console.log(`❌ ${platform} Resource Monitor failed: ${resourceRes.status}`);
      return null;
    }
  });
}

/**
 * Calculate resource efficiency metrics
 */
export function calculateResourceEfficiency(beforeStats, afterStats, metrics) {
  if (!beforeStats || !afterStats || !metrics) {
    return null;
  }
  
  const duration = new Date(afterStats.timestamp) - new Date(beforeStats.timestamp);
  const durationMin = duration / (1000 * 60);
  
  return {
    platform: beforeStats.platform,
    testDuration: durationMin,
    resourceUtilization: {
      beforeTest: beforeStats.data,
      afterTest: afterStats.data,
      efficiency: {
        opsPerSecond: metrics.operations_per_second || 0,
        memoryGrowth: metrics.memory_usage ? metrics.memory_usage.heap_growth_mb : 0,
        responseTime: metrics.duration_ms || 0
      }
    }
  };
}

/**
 * Enhanced resource monitoring for both platforms during testing
 * This provides better insights into actual resource consumption
 */
export default {
  collectResourceStats,
  calculateResourceEfficiency
};

