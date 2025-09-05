#!/usr/bin/env python3
"""
K6 Test Results Analyzer
Makes k6 JSON results easy to understand with clear performance comparisons
"""

import json
import sys
import os
from datetime import datetime

def format_ms(ms):
    """Format milliseconds to readable string"""
    if ms < 1000:
        return f"{ms:.1f}ms"
    elif ms < 60000:
        return f"{ms/1000:.2f}s"
    else:
        return f"{ms/60000:.1f}m"

def analyze_results(summary_file):
    """Analyze k6 test results and provide clear insights"""
    
    try:
        with open(summary_file, 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"❌ Could not find results file: {summary_file}")
        return
    except json.JSONDecodeError:
        print(f"❌ Could not parse JSON in: {summary_file}")
        return
    
    metrics = data.get('metrics', {})
    
    print("=" * 60)
    print("🧪 AZURE FUNCTIONS VS KUBERNETES COMPARISON")
    print("=" * 60)
    
    # Overall test info
    iterations = metrics.get('iterations', {}).get('count', 0)
    iteration_duration = metrics.get('iteration_duration', {})
    
    # Calculate test duration from iteration data since state info may be missing
    if iteration_duration and 'avg' in iteration_duration:
        estimated_duration = (iteration_duration['avg'] * iterations) / 1000 / 60  # Convert to minutes
    else:
        estimated_duration = 0
    
    print(f"📊 Test Overview:")
    print(f"   • Total iterations: {iterations}")
    print(f"   • Estimated duration: {estimated_duration:.1f} minutes")
    print(f"   • All checks passed: {metrics.get('checks', {}).get('value', 0) == 1}")
    print(f"   • Success rate: {100 - (metrics.get('errors', {}).get('value', 0) * 100):.1f}%")
    
    print("\n" + "=" * 60)
    print("🏆 PERFORMANCE COMPARISON")
    print("=" * 60)
    
    # Get platform-specific metrics
    functions_metrics = metrics.get('http_req_duration{platform:functions}', {})
    k8s_metrics = metrics.get('http_req_duration{platform:k8s}', {})
    
    if functions_metrics and k8s_metrics:
        print("\n📈 Response Time Comparison:")
        print("-" * 40)
        
        func_avg = functions_metrics.get('avg', 0)
        func_p95 = functions_metrics.get('p(95)', 0)
        k8s_avg = k8s_metrics.get('avg', 0)
        k8s_p95 = k8s_metrics.get('p(95)', 0)
        
        print(f"                    Average    P95")
        print(f"Azure Functions    {format_ms(func_avg):>8}  {format_ms(func_p95):>8}")
        print(f"Kubernetes         {format_ms(k8s_avg):>8}  {format_ms(k8s_p95):>8}")
        
        # Calculate performance differences
        if k8s_avg > 0:
            avg_diff = ((func_avg - k8s_avg) / k8s_avg * 100)
            p95_diff = ((func_p95 - k8s_p95) / k8s_p95 * 100)
            
            print(f"\n🎯 Performance Difference:")
            print(f"   • Average: Kubernetes is {abs(avg_diff):.1f}% {'faster' if avg_diff > 0 else 'slower'}")
            print(f"   • P95: Kubernetes is {abs(p95_diff):.1f}% {'faster' if p95_diff > 0 else 'slower'}")
    
    # Resource Performance Summary
    func_ops = metrics.get('functions_ops_per_second', {})
    k8s_ops = metrics.get('k8s_ops_per_second', {})
    func_mem_peak = metrics.get('functions_memory_peak_mb', {})
    k8s_mem_peak = metrics.get('k8s_memory_peak_mb', {})
    
    if func_ops and k8s_ops and func_mem_peak and k8s_mem_peak:
        print(f"\n🔥 RESOURCE COMPARISON:")
        print("-" * 40)
        
        func_ops_avg = func_ops.get('avg', 0)
        k8s_ops_avg = k8s_ops.get('avg', 0)
        func_peak_avg = func_mem_peak.get('avg', 0)
        k8s_peak_avg = k8s_mem_peak.get('avg', 0)
        
        print(f"CPU Ops/sec:  Functions {func_ops_avg:>8.0f}  |  K8s {k8s_ops_avg:>8.0f}")
        print(f"Memory Peak:  Functions {func_peak_avg:>6.1f}MB  |  K8s {k8s_peak_avg:>6.1f}MB")
        
        # Winners
        cpu_winner = 'K8s' if k8s_ops_avg > func_ops_avg else 'Functions'
        mem_winner = 'K8s' if k8s_peak_avg < func_peak_avg else 'Functions'
        print(f"\n🏆 CPU Winner: {cpu_winner}")
        print(f"🏆 Memory Winner: {mem_winner}")
    
    # Cold starts
    cold_starts = metrics.get('functions_cold_starts', {}).get('count', 0)
    print(f"\n❄️  Cold Starts:")
    print(f"   • Functions cold starts detected: {cold_starts}")
    if cold_starts > 0:
        print(f"   • This explains some of the higher latency in Functions")
    
    # Error analysis
    print(f"\n🔍 Reliability:")
    http_failures = metrics.get('http_req_failed', {}).get('passes', 0)
    total_requests = metrics.get('http_reqs', {}).get('count', 0)
    error_rate = (http_failures / total_requests * 100) if total_requests > 0 else 0
    
    print(f"   • Total requests: {total_requests}")
    print(f"   • Failed requests: {http_failures}")
    print(f"   • Success rate: {100 - error_rate:.1f}%")
    
    # Test breakdown by function
    print(f"\n📋 Test Breakdown:")
    print("-" * 30)
    root_group = data.get('root_group', {}).get('groups', {})
    
    for test_name, test_data in root_group.items():
        checks = test_data.get('checks', {})
        total_checks = sum(check.get('passes', 0) + check.get('fails', 0) for check in checks.values())
        passed_checks = sum(check.get('passes', 0) for check in checks.values())
        
        status = "✅" if passed_checks == total_checks else "❌"
        print(f"   {status} {test_name}: {passed_checks}/{total_checks} checks passed")
    
    # Simple Cost Summary
    print(f"\n💰 COST SUMMARY:")
    print("-" * 40)
    
    total_requests = metrics.get('http_reqs', {}).get('count', 0)
    test_duration_min = estimated_duration
    
    print(f"Test: {total_requests} requests in {test_duration_min:.1f} min")
    print(f"Functions: ~${total_requests * 0.0000002:.6f} (pay per request)")
    print(f"K8s: ~${73/30/24/60 * test_duration_min:.6f} (always running)")
    print(f"Break-even: ~365M requests/month")

    # Simple Recommendations
    print(f"\n🎯 RECOMMENDATION:")
    print("-" * 40)
    
    if functions_metrics and k8s_metrics:
        if functions_metrics.get('avg', 0) < k8s_metrics.get('avg', 0):
            print("✅ Functions: Faster response times")
        else:
            print("✅ K8s: Better response performance")
    
    if cold_starts > 0:
        cold_start_rate = (cold_starts / max(total_requests, 1)) * 100
        if cold_start_rate < 5:
            print("✅ Functions: Low cold start impact")
    
    print("\n💡 Choose Functions for:")
    print("   • Variable traffic, fast responses, easy scaling")
    print("\n💡 Choose K8s for:")
    print("   • Consistent traffic, always-warm, full control")
    
    print("\n" + "=" * 60)

def main():
    """Main entry point"""
    if len(sys.argv) > 1:
        summary_file = sys.argv[1]
    else:
        # Look for the most recent summary file
        results_dir = "results"
        if os.path.exists(results_dir):
            summary_files = [f for f in os.listdir(results_dir) if f.endswith('_summary.json')]
            if summary_files:
                summary_files.sort(reverse=True)  # Most recent first
                summary_file = os.path.join(results_dir, summary_files[0])
                print(f"📁 Using most recent results: {summary_files[0]}")
            else:
                print("❌ No summary files found in results/ directory")
                print("Usage: python3 analyze-results.py [path-to-summary.json]")
                return
        else:
            print("❌ No results directory found")
            print("Usage: python3 analyze-results.py [path-to-summary.json]")
            return
    
    analyze_results(summary_file)

if __name__ == "__main__":
    main()
