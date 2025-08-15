#!/bin/bash
# k6-tests/run-simple-test.sh - Simple endpoint verification

echo "=== Simple Benchmark Test ==="
echo "Testing endpoints with minimal load"
echo ""

# Create results directory
mkdir -p results

echo "1. Testing Azure Functions (Serverless)..."
echo "=========================================="
k6 run --env TEST_ENV=serverless simple-test.js

echo ""
echo "Waiting 30 seconds before testing Kubernetes..."
sleep 30

echo "2. Testing Kubernetes..."
echo "========================"
k6 run --env TEST_ENV=kubernetes simple-test.js

echo ""
echo "=== Simple Tests Complete ==="
echo "Both environments tested with minimal load"
