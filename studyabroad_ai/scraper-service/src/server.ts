/**
 * StudyAbroad.AI — Scraper Service Entry Point
 * Node.js + TypeScript microservice — internal only, never exposed to internet
 *
 * Responsibilities:
 *   - Puppeteer stealth scraping (bypasses Cloudflare, anti-bot systems)
 *   - Bull job queue (Redis-backed) for scraping tasks
 *   - Socket.io server — pushes real-time scraping events to clients
 *   - Redis pub/sub bridge — communicates with Python FastAPI
 */

import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { initSocketServer } from './socket';
import { initQueues } from './queue';
import { initRedisBridge } from './redis-bridge';
import { logger } from './logger';

const PORT = parseInt(process.env.SCRAPER_PORT || '3001', 10);

async function bootstrap() {
  const app = express();
  const httpServer = createServer(app);

  // ── Middleware ──────────────────────────────────────────────
  app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'] }));
  app.use(express.json({ limit: '10mb' }));

  // ── Socket.io (real-time scraping events) ──────────────────
  const io = initSocketServer(httpServer);
  logger.info('[Server] Socket.io initialized');

  // ── Bull job queues (Redis-backed) ─────────────────────────
  await initQueues(io);
  logger.info('[Server] Bull queues initialized');

  // ── Redis pub/sub bridge (Python ↔ Node.js) ────────────────
  await initRedisBridge(io);
  logger.info('[Server] Redis bridge initialized');

  // ── Health check ───────────────────────────────────────────
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'scraper-service',
      version: '1.0.0',
      tool: 'puppeteer-extra + stealth plugin (Cloudflare bypass)',
      timestamp: new Date().toISOString(),
    });
  });

  // ── Manual scrape trigger (called by Python FastAPI) ───────
  app.post('/scrape/university', async (req, res) => {
    try {
      const { url, priority = 'normal', metadata = {} } = req.body;
      if (!url) return res.status(400).json({ error: 'url required' });

      const { universityScrapeQueue } = await import('./queue');
      const job = await universityScrapeQueue.add(
        'scrape-university',
        { url, metadata },
        {
          priority: priority === 'high' ? 1 : 5,
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
        }
      );

      res.json({ job_id: job.id, status: 'queued', url });
    } catch (err) {
      logger.error('[API] /scrape/university error:', err);
      res.status(500).json({ error: String(err) });
    }
  });

  app.post('/scrape/scholarship', async (req, res) => {
    try {
      const { url, priority = 'normal' } = req.body;
      if (!url) return res.status(400).json({ error: 'url required' });

      const { scholarshipScrapeQueue } = await import('./queue');
      const job = await scholarshipScrapeQueue.add(
        'scrape-scholarship',
        { url },
        { attempts: 3, backoff: { type: 'exponential', delay: 5000 } }
      );

      res.json({ job_id: job.id, status: 'queued', url });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // ── Queue stats ────────────────────────────────────────────
  app.get('/queues/stats', async (req, res) => {
    try {
      const { universityScrapeQueue, scholarshipScrapeQueue } = await import('./queue');
      const [uniStats, schStats] = await Promise.all([
        universityScrapeQueue.getJobCounts(),
        scholarshipScrapeQueue.getJobCounts(),
      ]);
      res.json({
        university_queue: uniStats,
        scholarship_queue: schStats,
      });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // ── Start ──────────────────────────────────────────────────
  httpServer.listen(PORT, () => {
    logger.info(`🕷️  StudyAbroad.AI Scraper Service running on :${PORT}`);
    logger.info('    Puppeteer + stealth: Cloudflare bypass active');
    logger.info('    Bull queue: Redis-backed job management');
    logger.info('    Socket.io: Real-time scraping events');
  });
}

bootstrap().catch((err) => {
  logger.error('Fatal bootstrap error:', err);
  process.exit(1);
});
