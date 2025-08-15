#!/bin/bash
# k6-tests/run-all-benchmarks.sh

echo "=== NBU DevInsights Benchmark Suite ==="
echo "Testing three separate benchmark endpoints"
echo ""

# Create results directory
mkdir -p results

# 1. CPU Benchmark
echo "1. Running CPU Benchmark Tests..."
echo "================================="
echo "Testing Azure Functions..."
k6 run --env TEST_ENV=serverless --out json=results/functions-cpu.json cpu-benchmark.js

echo ""
echo "Waiting 1 minute..."
sleep 60

echo "Testing Kubernetes..."
k6 run --env TEST_ENV=kubernetes --out json=results/k8s-cpu.json cpu-benchmark.js

# 2. Memory Benchmark
echo ""
echo "2. Running Memory Benchmark Tests..."
echo "===================================="
echo "Testing Azure Functions..."
k6 run --env TEST_ENV=serverless --out json=results/functions-memory.json memory-benchmark.js

echo ""
echo "Waiting 1 minute..."
sleep 60

echo "Testing Kubernetes..."
k6 run --env TEST_ENV=kubernetes --out json=results/k8s-memory.json memory-benchmark.js

# 3. Latency Benchmark
echo ""
echo "3. Running Latency Benchmark Tests..."
echo "====================================="
echo "Testing Azure Functions..."
k6 run --env TEST_ENV=serverless --out json=results/functions-latency.json latency-benchmark.js

echo ""
echo "Waiting 1 minute..."
sleep 60

echo "Testing Kubernetes..."
k6 run --env TEST_ENV=kubernetes --out json=results/k8s-latency.json latency-benchmark.js

echo ""
echo "=== All Tests Complete ==="
echo "Results saved in results/ directory:"
ls -la results/