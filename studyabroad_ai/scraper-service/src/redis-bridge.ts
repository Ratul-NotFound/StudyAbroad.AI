/**
 * Redis Pub/Sub Bridge — Python FastAPI ↔ Node.js Scraper communication
 * Python publishes scrape requests → Node.js picks up and runs Puppeteer
 * Node.js publishes results → Python FastAPI runs AI extraction on them
 */

import IORedis from 'ioredis';
import type { Server as SocketServer } from 'socket.io';
import { universityScrapeQueue, scholarshipScrapeQueue } from './queue';
import { logger } from './logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Separate connections for publish and subscribe
let publisher: IORedis;
let subscriber: IORedis;

// ── Channel definitions ───────────────────────────────────────────────────────
const CHANNELS = {
  // Python → Node.js (scraping requests)
  SCRAPE_REQUEST_UNIVERSITY: 'studyabroad:scrape:request:university',
  SCRAPE_REQUEST_SCHOLARSHIP: 'studyabroad:scrape:request:scholarship',
  SCRAPE_REQUEST_VISA: 'studyabroad:scrape:request:visa',

  // Node.js → Python (scraping results)
  SCRAPE_RESULT_UNIVERSITY: 'studyabroad:scrape:result:university',
  SCRAPE_RESULT_SCHOLARSHIP: 'studyabroad:scrape:result:scholarship',

  // System events
  SYSTEM_HEALTH: 'studyabroad:system:health',
} as const;

export async function initRedisBridge(io: SocketServer): Promise<void> {
  publisher = new IORedis(REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 3 });
  subscriber = new IORedis(REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 3 });

  await publisher.connect();
  await subscriber.connect();

  // ── Listen for scrape requests from Python FastAPI ────────────────────────
  await subscriber.subscribe(
    CHANNELS.SCRAPE_REQUEST_UNIVERSITY,
    CHANNELS.SCRAPE_REQUEST_SCHOLARSHIP,
    CHANNELS.SCRAPE_REQUEST_VISA
  );

  subscriber.on('message', async (channel, message) => {
    try {
      const payload = JSON.parse(message);
      logger.info(`[Redis Bridge] Received on ${channel}:`, payload);

      if (channel === CHANNELS.SCRAPE_REQUEST_UNIVERSITY) {
        // Add to Bull queue with priority from Python
        await universityScrapeQueue.add('scrape-university', payload, {
          priority: payload.priority === 'high' ? 1 : 5,
          attempts: 3,
          jobId: payload.job_id, // Use Python's job ID for tracking
        });
        logger.info(`[Redis Bridge] University job queued: ${payload.url}`);
      }

      if (channel === CHANNELS.SCRAPE_REQUEST_SCHOLARSHIP) {
        await scholarshipScrapeQueue.add('scrape-scholarship', payload, {
          attempts: 3,
          jobId: payload.job_id,
        });
        logger.info(`[Redis Bridge] Scholarship job queued: ${payload.url}`);
      }

    } catch (err) {
      logger.error(`[Redis Bridge] Failed to process message:`, err);
    }
  });

  // ── Health heartbeat (every 30s) ──────────────────────────────────────────
  setInterval(async () => {
    await publisher.publish(CHANNELS.SYSTEM_HEALTH, JSON.stringify({
      service: 'scraper-service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    }));
  }, 30000);

  subscriber.on('error', (err) => logger.error('[Redis Bridge] Subscriber error:', err));
  publisher.on('error', (err) => logger.error('[Redis Bridge] Publisher error:', err));

  logger.info('[Redis Bridge] Pub/Sub bridge initialized');
  logger.info(`[Redis Bridge] Subscribed to: ${Object.values(CHANNELS).join(', ')}`);
}

/**
 * Publish a message to Redis — called by queue workers to send results to Python
 */
export async function publishToRedis(channel: string, data: object): Promise<void> {
  const fullChannel = `studyabroad:${channel}`;
  try {
    await publisher.publish(fullChannel, JSON.stringify(data));
    logger.debug(`[Redis Bridge] Published to ${fullChannel}`);
  } catch (err) {
    logger.error(`[Redis Bridge] Publish failed:`, err);
  }
}
