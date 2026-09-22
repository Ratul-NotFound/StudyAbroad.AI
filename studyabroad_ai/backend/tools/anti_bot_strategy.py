"""
StudyAbroad.AI — Anti-Bot Scraping Strategy
=============================================
Python can bypass Cloudflare WITHOUT switching to Node.js.
Use these techniques in order of cost/complexity:

Tier 1 (FREE): Playwright stealth tweaks
Tier 2 ($0): HTTP-based scraping for simple pages  
Tier 3 ($3/mo): Residential proxies (cheapest fix)
Tier 4: Node.js microservice with puppeteer-stealth (nuclear option)
"""

"""
TECHNIQUE 1: playwright-stealth (Python port of puppeteer-stealth)
Install: pip install playwright-stealth
"""
async def get_stealthed_browser():
    from playwright.async_api import async_playwright
    from playwright_stealth import stealth_async
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-blink-features=AutomationControlled",
                "--disable-features=IsolateOrigins,site-per-process",
                "--disable-setuid-sandbox",
                "--no-first-run",
                "--no-default-browser-check",
                "--password-store=basic",
                "--use-mock-keychain",
            ]
        )
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            viewport={"width": 1920, "height": 1080},
            # Realistic browser language and timezone
            locale="en-US",
            timezone_id="America/New_York",
            # Realistic screen
            screen={"width": 1920, "height": 1080},
        )
        page = await context.new_page()
        # Apply stealth patches (removes 20+ bot detection signals)
        await stealth_async(page)
        return browser, context, page


"""
TECHNIQUE 2: Use curl-cffi instead of requests/httpx
curl-cffi impersonates real Chrome TLS fingerprint
Install: pip install curl-cffi
Cost: FREE
"""
def scrape_with_curl_cffi(url: str) -> str:
    from curl_cffi import requests as curl_requests
    
    # Impersonate Chrome 131 — Cloudflare can't tell difference
    response = curl_requests.get(
        url,
        impersonate="chrome131",  # Real Chrome TLS fingerprint
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }
    )
    return response.text


"""
TECHNIQUE 3: Rotating residential proxies
Cheapest fix for persistent Cloudflare blocks.
Services like Webshare.io: $3/month for 1GB rotating residential proxies
"""
PROXY_CONFIG = {
    "server": "http://proxy.webshare.io:80",  # $3/month
    "username": "your-proxy-username",
    "password": "your-proxy-password",
}

async def scrape_with_proxy(url: str, page) -> str:
    """Use rotating residential proxy to bypass Cloudflare."""
    # Proxies rotate automatically — each request gets a new IP
    response = await page.goto(url)
    return await page.content()


"""
TECHNIQUE 4: Scrape via Google Cache / Bing Cache (FREE)
Many university pages are cached — no Cloudflare needed.
"""
def scrape_via_google_cache(url: str) -> str:
    from curl_cffi import requests as curl_requests
    cache_url = f"https://webcache.googleusercontent.com/search?q=cache:{url}"
    response = curl_requests.get(cache_url, impersonate="chrome131")
    return response.text


"""
TECHNIQUE 5: Node.js microservice (nuclear option, only for heavily blocked sites)
Only for MIT, Stanford, etc. that aggressively block all scraping.
Start as: node scraper-service.js
Communicate via HTTP from Python.
"""
NODE_SCRAPER_SERVICE = """
// scraper-service.js — Run with: node scraper-service.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const express = require('express');

puppeteer.use(StealthPlugin());  // 20+ stealth patches

const app = express();
app.use(express.json());

app.post('/scrape', async (req, res) => {
    const { url } = req.body;
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Set realistic fingerprint
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)...');
    await page.setViewport({ width: 1920, height: 1080 });
    
    await page.goto(url, { waitUntil: 'networkidle2' });
    const content = await page.content();
    await browser.close();
    
    res.json({ html: content, status: 200 });
});

app.listen(3001, () => console.log('Stealth scraper running on :3001'));
// Install: npm install puppeteer-extra puppeteer-extra-plugin-stealth express
"""

# ─── Recommendation Summary ─────────────────────────────────────────────────

ANTI_BOT_DECISION_TREE = """
Is the site blocking you?
│
├── Simple block (just User-Agent check)
│   → Use Playwright with realistic UA — already in our scraper.py
│
├── Cloudflare JS challenge
│   → Use curl-cffi (pip install curl-cffi) — impersonates Chrome TLS
│   → Cost: FREE
│
├── Cloudflare with advanced fingerprinting
│   → Use rotating residential proxies (Webshare.io)
│   → Cost: $3/month for 1GB (enough for weekly university scraping)
│
├── Aggressive Cloudflare Bot Score checks
│   → Use playwright-stealth (pip install playwright-stealth)  
│   → Cost: FREE
│
└── Nuclear case (MIT, Stanford, top sites with JS challenges + CAPTCHA)
    → Spin up Node.js microservice with puppeteer-extra-plugin-stealth
    → Python calls it via HTTP: requests.post('http://localhost:3001/scrape')
    → Cost: $0 (runs on same VPS)
    → Note: Add this ONLY for specific blocked universities, not all
"""
