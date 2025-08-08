// kubernetes/backend-kubernetes-ts/src/routes/benchmark.ts
import { Router } from 'express';
import BenchmarkController from '../controllers/benchmark-controller';

const router = Router();
const controller = new BenchmarkController();

// CPU benchmark endpoint
router.get('/cpu', controller.cpuBenchmark);
router.post('/cpu', controller.cpuBenchmark);

// Memory benchmark endpoint
router.get('/memory', controller.memoryBenchmark);
router.post('/memory', controller.memoryBenchmark);

// Latency benchmark endpoint
router.get('/latency', controller.latencyBenchmark);
router.post('/latency', controller.latencyBenchmark);

// Health check for benchmarks
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    endpoints: ['/cpu', '/memory', '/latency'],
    instance_id: process.env.HOSTNAME || 'unknown',
    timestamp: new Date().toISOString()
  });
});

export default router;