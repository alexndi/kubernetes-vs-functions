// kubernetes/backend-kubernetes-ts/src/routes/benchmark.ts
import { Router } from 'express';
import BenchmarkController from '../controllers/benchmark-controller';

const router = Router();
const controller = new BenchmarkController();

// CPU benchmark endpoint
router.get('/cpu', controller.cpuBenchmark.bind(controller));
router.post('/cpu', controller.cpuBenchmark.bind(controller));

// Memory benchmark endpoint
router.get('/memory', controller.memoryBenchmark.bind(controller));
router.post('/memory', controller.memoryBenchmark.bind(controller));

// Latency benchmark endpoint
router.get('/latency', controller.latencyBenchmark.bind(controller));
router.post('/latency', controller.latencyBenchmark.bind(controller));

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