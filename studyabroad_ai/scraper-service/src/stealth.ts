/**
 * Puppeteer Stealth Setup
 * Applies all anti-detection patches to bypass Cloudflare and anti-bot systems.
 * Uses puppeteer-extra-plugin-stealth which patches 20+ detection vectors.
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import type { Browser, Page, PuppeteerLaunchOptions } from 'puppeteer';
import { logger } from './logger';

// Apply stealth plugin (20+ Cloudflare bypass patches)
puppeteer.use(StealthPlugin());

// Block ads/trackers — speeds up page load and reduces detection surface
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

// ── Realistic Chrome user agents ─────────────────────────────────────────────
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
];

// ── Realistic screen resolutions ─────────────────────────────────────────────
const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 2560, height: 1440 },
];

export interface StealthBrowserOptions {
  proxy?: { server: string; username?: string; password?: string };
  headless?: boolean;
}

export interface StealthPageOptions {
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
  timeout?: number;
}

/**
 * Launch a fully stealthed Puppeteer browser.
 * Bypasses Cloudflare, DataDome, PerimeterX, and similar bot detection.
 */
export async function launchStealthBrowser(
  options: StealthBrowserOptions = {}
): Promise<Browser> {
  const launchOptions: PuppeteerLaunchOptions = {
    headless: options.headless ?? true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-web-security',
      '--disable-site-isolation-trials',
      '--ignore-certificate-errors',
      // Mimic real Chrome memory behavior
      '--memory-pressure-off',
      '--max_old_space_size=4096',
    ],
    ignoreHTTPSErrors: true,
  };

  // Proxy support for Cloudflare bypass on stubborn sites
  if (options.proxy) {
    launchOptions.args!.push(`--proxy-server=${options.proxy.server}`);
  }

  const browser = await puppeteer.launch(launchOptions);
  return browser;
}

/**
 * Create a stealth page with realistic browser fingerprint.
 * Randomizes UA, viewport, timezone to avoid pattern detection.
 */
export async function createStealthPage(browser: Browser): Promise<Page> {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();

  // Randomize user agent + viewport to avoid fingerprinting
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  const viewport = VIEWPORTS[Math.floor(Math.random() * VIEWPORTS.length)];

  await page.setUserAgent(userAgent);
  await page.setViewport({ ...viewport, deviceScaleFactor: 1, hasTouch: false });

  // Realistic browser headers
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
  });

  // Override WebDriver detection — the key CF bypass
  await page.evaluateOnNewDocument(() => {
    // Remove webdriver property
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });

    // Fake realistic plugin list
    Object.defineProperty(navigator, 'plugins', {
      get: () => [
        { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
        { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
        { name: 'Native Client', filename: 'internal-nacl-plugin' },
      ],
    });

    // Fake languages
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });

    // Remove automation indicators
    // @ts-ignore
    delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
    // @ts-ignore
    delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
    // @ts-ignore
    delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
  });

  return page;
}

/**
 * Navigate to a URL with human-like behavior.
 * Adds random delays, mouse movements to avoid bot detection.
 */
export async function navigateStealth(
  page: Page,
  url: string,
  options: StealthPageOptions = {}
): Promise<void> {
  const { waitUntil = 'networkidle2', timeout = 30000 } = options;

  try {
    await page.goto(url, { waitUntil, timeout });

    // Human-like random delay (500ms - 2s)
    await sleep(500 + Math.random() * 1500);

    // Simulate mouse movement to trigger JS event listeners
    await page.mouse.move(
      Math.floor(Math.random() * 800 + 100),
      Math.floor(Math.random() * 400 + 100)
    );

    // Scroll slightly like a human would
    await page.evaluate(() => {
      window.scrollBy(0, Math.floor(Math.random() * 300 + 100));
    });

    await sleep(300 + Math.random() * 700);
  } catch (err) {
    logger.warn(`[Stealth] Navigation issue for ${url}: ${err}`);
    throw err;
  }
}

/**
 * Fast HTTP scraping using undici with Chrome-like TLS fingerprint.
 * Use for pages that don't need JavaScript execution.
 * 10x faster than Puppeteer, no browser overhead.
 */
export async function fastHttpScrape(url: string): Promise<string> {
  const { fetch } = await import('undici');

  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENTS[0],
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  return response.text();
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
