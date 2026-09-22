/**
 * Bull Job Queues — Redis-backed scraping job management
 * Handles: retries, priorities, concurrency, rate limiting
 */

import Bull from 'bull';
import type { Server as SocketServer } from 'socket.io';
import { launchStealthBrowser, createStealthPage, navigateStealth, fastHttpScrape, sleep } from './stealth';
import { logger } from './logger';
import { parseUniversityPage } from './scrapers/university';
import { parseScholarshipPage } from './scrapers/scholarship';
import { publishToRedis } from './redis-bridge';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// ── Queue instances (exported for route handlers) ─────────────────────────────
export const universityScrapeQueue = new Bull('university-scrape', REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export const scholarshipScrapeQueue = new Bull('scholarship-scrape', REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export const visaScrapeQueue = new Bull('visa-scrape', REDIS_URL, {
  defaultJobOptions: { attempts: 2, removeOnComplete: 50 },
});

// ── Initialize all queue workers ──────────────────────────────────────────────
export async function initQueues(io: SocketServer): Promise<void> {

  // ── University Scraper Worker ────────────────────────────────────────────
  universityScrapeQueue.process(
    'scrape-university',
    parseInt(process.env.SCRAPER_CONCURRENCY || '3'), // 3 concurrent Puppeteer sessions
    async (job) => {
      const { url, metadata } = job.data;
      logger.info(`[Queue] Scraping university: ${url}`);

      // Emit start event via Socket.io
      io.emit('scrape:started', { job_id: job.id, url, type: 'university' });

      let browser;
      let htmlContent: string;

      try {
        // Strategy 1: Fast HTTP (no browser overhead, 10x faster)
        // Try this first — works for most university sites
        try {
          htmlContent = await fastHttpScrape(url);
          logger.info(`[Queue] Fast HTTP success for ${url}`);
        } catch {
          // Strategy 2: Puppeteer stealth (for JS-heavy / Cloudflare sites)
          logger.info(`[Queue] Falling back to Puppeteer stealth for ${url}`);
          browser = await launchStealthBrowser({ headless: true });
          const page = await createStealthPage(browser);
          await navigateStealth(page, url);
          htmlContent = await page.content();
        }

        // Parse extracted HTML into structured data
        const universityData = await parseUniversityPage(htmlContent, url, metadata);

        // Update progress
        await job.progress(80);

        // Publish to Redis → Python FastAPI picks it up to run AI extraction
        await publishToRedis('scrape:university:result', {
          job_id: job.id,
          url,
          data: universityData,
          metadata,
          scraped_at: new Date().toISOString(),
        });

        // Emit completion event
        io.emit('scrape:completed', {
          job_id: job.id,
          url,
          type: 'university',
          success: true,
          records: 1,
        });

        await job.progress(100);
        return { success: true, url, data: universityData };

      } catch (err) {
        logger.error(`[Queue] University scrape failed for ${url}:`, err);
        io.emit('scrape:failed', { job_id: job.id, url, error: String(err) });
        throw err;
      } finally {
        if (browser) await browser.close();
      }
    }
  );

  // ── Scholarship Scraper Worker ───────────────────────────────────────────
  scholarshipScrapeQueue.process(
    'scrape-scholarship',
    2, // 2 concurrent
    async (job) => {
      const { url } = job.data;
      logger.info(`[Queue] Scraping scholarship: ${url}`);
      io.emit('scrape:started', { job_id: job.id, url, type: 'scholarship' });

      let browser;
      try {
        let htmlContent: string;
        try {
          htmlContent = await fastHttpScrape(url);
        } catch {
          browser = await launchStealthBrowser({ headless: true });
          const page = await createStealthPage(browser);
          await navigateStealth(page, url);
          htmlContent = await page.content();
        }

        const scholarshipData = await parseScholarshipPage(htmlContent, url);

        await publishToRedis('scrape:scholarship:result', {
          job_id: job.id,
          url,
          data: scholarshipData,
          scraped_at: new Date().toISOString(),
        });

        io.emit('scrape:completed', { job_id: job.id, url, type: 'scholarship', success: true });
        return { success: true, url };

      } catch (err) {
        logger.error(`[Queue] Scholarship scrape failed:`, err);
        io.emit('scrape:failed', { job_id: job.id, url, error: String(err) });
        throw err;
      } finally {
        if (browser) await browser.close();
      }
    }
  );

  // ── Queue Event Listeners ────────────────────────────────────────────────
  [universityScrapeQueue, scholarshipScrapeQueue].forEach((queue) => {
    queue.on('error', (err) => logger.error(`[Bull] Queue error:`, err));
    queue.on('failed', (job, err) =>
      logger.warn(`[Bull] Job ${job.id} failed (attempt ${job.attemptsMade}):`, err.message)
    );
    queue.on('stalled', (job) =>
      logger.warn(`[Bull] Job ${job.id} stalled — will retry`)
    );
  });

  logger.info('[Queue] All Bull workers initialized');
}
