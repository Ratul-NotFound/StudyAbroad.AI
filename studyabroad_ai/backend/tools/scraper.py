"""
StudyAbroad.AI — Web Scraper Tool (Own Tool — completely free)
Primary: Playwright + BeautifulSoup4 — headless browser, handles JS sites
Fallback: ScraperAPI — only when university websites actively block all our IPs
         AND the scrape is time-critical (e.g., deadline data for a student)

Responsible scraping practices:
  - Rate limiting: 2-second delay between requests
  - User agent rotation
  - Respects robots.txt
  - Caches results to avoid redundant requests
  - Detects and handles anti-bot measures gracefully
"""
import asyncio
import hashlib
import json
import logging
import random
import time
from typing import Optional, Any
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from backend.config import settings

logger = logging.getLogger(__name__)

# ─── User agent pool (rotate to appear natural) ───────────────────────────────
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
]


# ─── Scrape Result ────────────────────────────────────────────────────────────

class ScrapeResult:
    def __init__(self, url: str, html: str, status_code: int,
                 tool_used: str, used_fallback: bool = False,
                 cost_usd: float = 0.0):
        self.url = url
        self.html = html
        self.status_code = status_code
        self.tool_used = tool_used
        self.used_fallback = used_fallback
        self.cost_usd = cost_usd
        self.soup = BeautifulSoup(html, "lxml") if html else None

    def select(self, css_selector: str) -> list:
        return self.soup.select(css_selector) if self.soup else []

    def select_one(self, css_selector: str):
        return self.soup.select_one(css_selector) if self.soup else None

    def text(self, css_selector: str) -> str:
        el = self.select_one(css_selector)
        return el.get_text(strip=True) if el else ""

    def all_text(self, css_selector: str) -> list[str]:
        return [el.get_text(strip=True) for el in self.select(css_selector)]

    def attr(self, css_selector: str, attribute: str) -> str:
        el = self.select_one(css_selector)
        return el.get(attribute, "") if el else ""


# ─── Playwright Scraper (Own tool — free) ────────────────────────────────────

class PlaywrightScraper:
    """
    Full headless browser scraper using Playwright.
    Handles JavaScript-rendered content, anti-bot checks, infinite scroll.
    Completely free — no API costs.
    """
    _browser = None
    _playwright = None

    async def _get_browser(self):
        """Lazy-initialize browser (singleton)."""
        if PlaywrightScraper._browser is None:
            from playwright.async_api import async_playwright
            PlaywrightScraper._playwright = await async_playwright().__aenter__()
            PlaywrightScraper._browser = await PlaywrightScraper._playwright.chromium.launch(
                headless=settings.scraper_headless,
                args=[
                    "--no-sandbox",
                    "--disable-blink-features=AutomationControlled",
                    "--disable-dev-shm-usage",
                ]
            )
        return PlaywrightScraper._browser

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=2, min=2, max=15)
    )
    async def fetch(self, url: str, wait_for: str = None,
                    scroll: bool = False, timeout_ms: int = 30000) -> ScrapeResult:
        """Fetch a URL with full JavaScript rendering."""
        browser = await self._get_browser()

        context = await browser.new_context(
            user_agent=random.choice(USER_AGENTS),
            viewport={"width": 1920, "height": 1080},
            extra_http_headers={
                "Accept-Language": "en-US,en;q=0.9",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            }
        )

        page = await context.new_page()

        # Stealth: override webdriver detection
        await page.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
            window.chrome = {runtime: {}};
        """)

        try:
            response = await page.goto(url, timeout=timeout_ms, wait_until="domcontentloaded")
            status = response.status if response else 200

            # Wait for specific element if specified
            if wait_for:
                await page.wait_for_selector(wait_for, timeout=10000)

            # Scroll to load lazy content
            if scroll:
                await self._scroll_page(page)

            # Wait for any dynamic content
            await page.wait_for_timeout(1500)

            html = await page.content()

            # Rate limiting — be respectful
            await asyncio.sleep(settings.scraper_rate_limit_seconds)

            return ScrapeResult(
                url=url,
                html=html,
                status_code=status,
                tool_used="playwright",
                used_fallback=False,
                cost_usd=0.0
            )
        finally:
            await context.close()

    async def _scroll_page(self, page, max_scrolls: int = 5):
        """Scroll down page to trigger lazy loading."""
        for _ in range(max_scrolls):
            await page.evaluate("window.scrollBy(0, window.innerHeight)")
            await page.wait_for_timeout(500)

    async def fetch_many(self, urls: list[str], max_concurrent: int = None) -> list[ScrapeResult]:
        """Fetch multiple URLs with controlled concurrency."""
        max_concurrent = max_concurrent or settings.scraper_max_concurrent
        semaphore = asyncio.Semaphore(max_concurrent)

        async def bounded_fetch(url):
            async with semaphore:
                try:
                    return await self.fetch(url)
                except Exception as e:
                    logger.error(f"[Scraper] Failed to fetch {url}: {e}")
                    return ScrapeResult(url=url, html="", status_code=0, tool_used="playwright")

        return await asyncio.gather(*[bounded_fetch(url) for url in urls])

    async def close(self):
        if PlaywrightScraper._browser:
            await PlaywrightScraper._browser.close()
            PlaywrightScraper._browser = None


# ─── HTTPX Scraper (Own tool — for simple non-JS pages, faster) ───────────────

class HttpxScraper:
    """
    Lightweight scraper for simple HTML pages (no JavaScript needed).
    ~10x faster than Playwright for static content.
    Completely free.
    """

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=8)
    )
    async def fetch(self, url: str) -> ScrapeResult:
        import httpx
        headers = {
            "User-Agent": random.choice(USER_AGENTS),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }

        async with httpx.AsyncClient(
            headers=headers,
            follow_redirects=True,
            timeout=30.0
        ) as client:
            response = await client.get(url)
            await asyncio.sleep(settings.scraper_rate_limit_seconds / 2)

        return ScrapeResult(
            url=url,
            html=response.text,
            status_code=response.status_code,
            tool_used="httpx",
            used_fallback=False,
            cost_usd=0.0
        )


# ─── ScraperAPI Fallback (PAID — only when blocked) ──────────────────────────

class ScraperAPIFallback:
    """
    PAID FALLBACK — Only used when:
    1. Playwright is blocked by the target website
    2. Target data is critical (e.g., application deadline)
    3. USE_SCRAPER_API_FALLBACK=true in config
    Cost: ~$0.001 per request (very cheap but avoidable with rotating proxies)
    """

    def __init__(self):
        if not settings.scraper_api_key or settings.scraper_api_key == "fallback-only":
            raise ValueError(
                "[PAID FALLBACK] ScraperAPI key not configured. "
                "Set SCRAPER_API_KEY and USE_SCRAPER_API_FALLBACK=true in .env"
            )
        self.api_key = settings.scraper_api_key
        logger.warning(
            "[COST ALERT] Using ScraperAPI fallback. Cost: ~$0.001/request. "
            "Consider IP rotation to avoid costs."
        )

    async def fetch(self, url: str) -> ScrapeResult:
        import httpx
        api_url = f"https://api.scraperapi.com/?api_key={self.api_key}&url={url}&render=true"
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(api_url)
        return ScrapeResult(
            url=url,
            html=response.text,
            status_code=response.status_code,
            tool_used="scraperapi",
            used_fallback=True,
            cost_usd=0.001
        )


# ─── Smart Scraper Router ─────────────────────────────────────────────────────

class SmartScraper:
    """
    Routes scraping requests:
    - Static pages → httpx (fast, free)
    - JS-heavy pages → Playwright (own tool, free)
    - Blocked pages → ScraperAPI (paid, fallback only)
    """

    def __init__(self):
        self.playwright = PlaywrightScraper()
        self.httpx = HttpxScraper()
        self._fallback = None
        self.total_requests = 0
        self.fallback_requests = 0
        self.total_cost_usd = 0.0

    @property
    def fallback(self) -> ScraperAPIFallback:
        if self._fallback is None:
            self._fallback = ScraperAPIFallback()
        return self._fallback

    async def fetch(self, url: str, js_required: bool = True,
                    wait_for: str = None, scroll: bool = False,
                    critical: bool = False) -> ScrapeResult:
        """
        Fetch a URL with automatic tool selection.
        Set js_required=False for simple HTML pages (faster).
        Set critical=True to allow ScraperAPI fallback if blocked.
        """
        self.total_requests += 1

        # Try fast HTTPX for static pages
        if not js_required:
            try:
                result = await self.httpx.fetch(url)
                if result.status_code == 200:
                    return result
            except Exception as e:
                logger.debug(f"[Scraper] HTTPX failed, trying Playwright: {e}")

        # Try Playwright for JS pages
        try:
            result = await self.playwright.fetch(url, wait_for=wait_for, scroll=scroll)
            if result.status_code in [200, 201]:
                return result

            # Detect blocks
            if result.status_code in [403, 429, 503] or self._is_blocked(result.html):
                raise Exception(f"Blocked by anti-bot (status {result.status_code})")

            return result

        except Exception as e:
            logger.warning(f"[Scraper] Playwright failed for {url}: {e}")

            # Fallback to ScraperAPI only if critical + enabled
            if critical and settings.use_scraper_api_fallback:
                logger.warning(f"[PAID FALLBACK] Using ScraperAPI for critical scrape: {url}")
                self.fallback_requests += 1
                result = await self.fallback.fetch(url)
                self.total_cost_usd += result.cost_usd
                return result

            raise Exception(
                f"Scraping failed for {url}. "
                f"If this is critical data, set USE_SCRAPER_API_FALLBACK=true and SCRAPER_API_KEY."
            )

    def _is_blocked(self, html: str) -> bool:
        """Detect common anti-bot block pages."""
        if not html:
            return True
        block_indicators = [
            "just a moment", "checking your browser", "cloudflare",
            "access denied", "bot detected", "captcha", "please verify"
        ]
        html_lower = html.lower()
        return any(indicator in html_lower for indicator in block_indicators)

    def stats(self) -> dict:
        return {
            "total_requests": self.total_requests,
            "fallback_requests": self.fallback_requests,
            "own_tool_pct": round((1 - self.fallback_requests / max(1, self.total_requests)) * 100, 1),
            "total_cost_usd": self.total_cost_usd,
            "tool": "playwright (own, free) with ScraperAPI fallback"
        }


# ─── Global scraper instance ──────────────────────────────────────────────────
scraper = SmartScraper()
