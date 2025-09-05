#!/bin/bash
# k6-tests/run-comparison.sh
# Lightweight comparison test between Azure Functions and Kubernetes

set -e  # Exit on any error

echo "=== Enhanced Functions vs Kubernetes Performance Comparison ==="
echo "Running progressive load tests optimized for trial accounts"
echo ""
echo "🔧 Enhanced Test Configuration:"
echo "- Progressive load: 1→3→8→15 VUs per phase"
echo "- Realistic workloads: Light/Moderate/Heavy complexity"
echo "- Comprehensive metrics: CPU ops/sec, Memory usage, Response times"
echo "- Cost analysis and resource efficiency comparison"
echo "- Total test time: ~14 minutes (safe for trial accounts)"
echo ""
echo "📊 Test Phases:"
echo "• Light Load: 1-3 VUs × 2min (10K iterations)"
echo "• Moderate Load: 1-8 VUs × 2min (50K iterations)" 
echo "• Burst Test: 1-15 VUs × 1min (100K iterations)"
echo ""

# Create results directory
mkdir -p results

# Get timestamp for unique filenames
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RESULT_FILE="results/comparison_${TIMESTAMP}"

echo "🚀 Starting comparison test..."
echo "Results will be saved to: ${RESULT_FILE}.json"
echo ""

# Run the comparison test
k6 run \
  --out json=${RESULT_FILE}.json \
  --summary-export=${RESULT_FILE}_summary.json \
  functions-vs-k8s-comparison.js

echo ""
echo "✅ Enhanced test completed successfully!"
echo ""
echo "📊 Results saved:"
echo "  - Detailed: ${RESULT_FILE}.json"
echo "  - Summary: ${RESULT_FILE}_summary.json"
echo ""
echo "🔍 Enhanced Analysis Available:"
echo "• CPU Performance: Operations per second comparison"
echo "• Memory Efficiency: Peak usage and growth patterns"  
echo "• Response Times: Progressive load testing results"
echo "• Cold Start Impact: Detailed analysis for Azure Functions"
echo "• Cost Analysis: Trial account impact and break-even points"
echo ""
echo "📋 Analysis Tools:"
echo "1. Console output above shows real-time enhanced summary"
echo "2. Run: python3 analyze-results.py for detailed insights"
echo "3. JSON files contain full metrics for further analysis"
echo ""
echo "💡 What's New vs Basic Test:"
echo "• Progressive load testing (1-15 VUs) vs single VU"
echo "• Realistic workloads (varied complexity) vs fixed light load"  
echo "• Resource efficiency metrics vs just response times"
echo "• Cost analysis and trial account impact assessment"
echo "• Enhanced recommendations based on actual usage patterns"
echo "• Simplified flow - removed warmup phases for faster testing"
