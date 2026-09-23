"""
StudyAbroad.AI — LLM Tool (Free Cloud APIs First — No Local Compute)
=======================================================================
Philosophy: Use FREE cloud APIs. No local GPU/VPS needed.
Ollama/local models REMOVED — they need expensive compute infrastructure.

Free LLM Priority Chain:
  1. Groq       — FASTEST, completely free (30 RPM), llama3.3-70b, no credit card
  2. Gemini     — Google free tier (15 RPM, 1M tokens/day), excellent quality
  3. OpenRouter — Free access to Qwen, Llama, Mistral via openrouter.ai
  4. OpenAI     — PAID emergency fallback only (never use unless critical)
  5. Anthropic  — PAID emergency fallback only

Cost breakdown (normal operation = $0/month):
  - Groq:       FREE — 30 req/min, 14,400 req/day, 131K context
  - Gemini:     FREE — 15 req/min, 1M tokens/day
  - OpenRouter: FREE — $1 free credit, many free models (Qwen, Llama)
  - OpenAI:     PAID — only triggered if all above fail on critical task

Getting free API keys (takes 2 minutes each):
  - Groq:       https://console.groq.com  (no credit card needed)
  - Gemini:     https://aistudio.google.com/app/apikey  (Google account)
  - OpenRouter: https://openrouter.ai  (free $1 credit on signup)
"""
import httpx
import json
import logging
import os
from typing import Optional
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

# Fix protobuf conflict from globally installed TensorFlow
os.environ.setdefault("PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION", "python")

from backend.config import settings

logger = logging.getLogger(__name__)


# ─── LLM Response ─────────────────────────────────────────────────────────────

class LLMResponse:
    def __init__(self, content: str, model: str, tool_used: str,
                 used_fallback: bool = False, tokens_used: int = 0,
                 cost_usd: float = 0.0):
        self.content = content
        self.model = model
        self.tool_used = tool_used
        self.used_fallback = used_fallback
        self.tokens_used = tokens_used
        self.cost_usd = cost_usd


# ─── Groq Client (FREE — fastest inference, no compute needed) ────────────────

class GroqClient:
    """
    Groq Cloud API — completely FREE, no credit card required.
    Runs Llama 3.3 70B at 275 tokens/second (faster than typing).
    Free tier: 30 requests/minute, 14,400 requests/day.
    Get key at: https://console.groq.com
    """
    BASE_URL = "https://api.groq.com/openai/v1"

    # Available free models on Groq (ordered by capability)
    MODELS = [
        "llama-3.3-70b-versatile",     # Best quality, 128K context
        "llama-3.1-8b-instant",         # Fastest, good for simple tasks
        "gemma2-9b-it",                 # Google Gemma, very capable
        "mixtral-8x7b-32768",           # Mixtral MoE, 32K context
    ]

    def __init__(self):
        # Key pool: collect all configured Groq keys for round-robin rotation
        self._key_pool = settings.all_groq_keys
        self._key_index = 0  # Current key index
        self.api_key = self._key_pool[0] if self._key_pool else ""
        self.model = settings.groq_model
        self.base_url = self.BASE_URL

    def _next_key(self) -> str:
        """Round-robin to next key in pool."""
        if not self._key_pool:
            return ""
        key = self._key_pool[self._key_index % len(self._key_pool)]
        self._key_index = (self._key_index + 1) % len(self._key_pool)
        return key

    def _active_key(self) -> str:
        """Get the current active key without advancing."""
        if not self._key_pool:
            return ""
        return self._key_pool[self._key_index % len(self._key_pool)]

    async def is_available(self) -> bool:
        return len(self._key_pool) > 0

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    async def generate(self, prompt: str, system_prompt: Optional[str] = None,
                       temperature: float = 0.7, max_tokens: int = 4096) -> LLMResponse:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        return await self.chat(messages, temperature, max_tokens)

    async def chat(self, messages: list[dict], temperature: float = 0.7,
                   max_tokens: int = 4096) -> LLMResponse:
        if not await self.is_available():
            raise ValueError("Groq API key not configured. Get a free key at https://console.groq.com")

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": False,
        }

        # Try all keys in pool before giving up (handles 429 rate limits gracefully)
        last_error = None
        for attempt in range(len(self._key_pool) + 1):
            key = self._next_key()
            try:
                async with httpx.AsyncClient(timeout=settings.llm_timeout_seconds) as client:
                    response = await client.post(
                        f"{self.base_url}/chat/completions",
                        headers={
                            "Authorization": f"Bearer {key}",
                            "Content-Type": "application/json",
                        },
                        json=payload
                    )
                    if response.status_code == 429:
                        # Rate limit hit on this key — try next key
                        logger.warning(f"[Groq] Key #{attempt+1} hit rate limit (429). Switching to next key.")
                        last_error = ValueError(f"Groq rate limit on key {attempt+1}")
                        continue
                    response.raise_for_status()
                    data = response.json()

                content = data["choices"][0]["message"]["content"]
                tokens = data.get("usage", {}).get("total_tokens", 0)

                return LLMResponse(
                    content=content,
                    model=self.model,
                    tool_used=f"groq (key pool: {len(self._key_pool)} keys)",
                    used_fallback=False,
                    tokens_used=tokens,
                    cost_usd=0.0  # Groq is FREE
                )
            except (httpx.HTTPStatusError, httpx.RequestError) as e:
                if hasattr(e, 'response') and getattr(e.response, 'status_code', 0) == 429:
                    logger.warning(f"[Groq] Key #{attempt+1} rate limited. Trying next.")
                    last_error = e
                    continue
                raise

        raise last_error or ValueError("All Groq keys exhausted")


# ─── Gemini Client (FREE tier — Google) ──────────────────────────────────────

class GeminiClient:
    """
    Google Gemini API free tier.
    Free: 15 requests/min, 1 million tokens/day.
    Get key at: https://aistudio.google.com/app/apikey
    """

    def __init__(self):
        self.api_key = settings.gemini_api_key
        self.model = settings.gemini_model
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"

    async def is_available(self) -> bool:
        return bool(self.api_key and self.api_key not in ("", "your-gemini-api-key-here"))

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=15)
    )
    async def generate(self, prompt: str, system_prompt: Optional[str] = None,
                       temperature: float = 0.7, max_tokens: int = 8192) -> LLMResponse:
        if not await self.is_available():
            raise ValueError("Gemini API key not configured.")

        contents = []
        full_prompt = prompt
        if system_prompt:
            full_prompt = f"[System]\n{system_prompt}\n\n[User]\n{prompt}"

        contents.append({"role": "user", "parts": [{"text": full_prompt}]})

        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
                "topP": 0.95,
            }
        }

        url = f"{self.base_url}/models/{self.model}:generateContent?key={self.api_key}"

        async with httpx.AsyncClient(timeout=settings.llm_timeout_seconds) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()

        content = data["candidates"][0]["content"]["parts"][0]["text"]
        tokens = data.get("usageMetadata", {}).get("totalTokenCount", 0)

        return LLMResponse(
            content=content,
            model=self.model,
            tool_used="gemini",
            used_fallback=False,
            tokens_used=tokens,
            cost_usd=0.0  # Free tier
        )

    async def chat(self, messages: list[dict], temperature: float = 0.7,
                   max_tokens: int = 8192) -> LLMResponse:
        combined = "\n\n".join([
            f"{'Assistant' if m['role'] == 'assistant' else 'User'}: {m['content']}"
            for m in messages
        ])
        return await self.generate(combined, temperature=temperature, max_tokens=max_tokens)


# ─── OpenRouter Client (FREE — Qwen, Llama, Mistral for free) ─────────────────

class OpenRouterClient:
    """
    OpenRouter — access to many free models (Qwen, Llama, Mistral).
    Free models available with just $0 balance.
    Get key at: https://openrouter.ai
    Free models: Qwen/QwQ-32B, Llama-3.1-8B, Mistral-7B, etc.
    """
    BASE_URL = "https://openrouter.ai/api/v1"

    # These models are free on OpenRouter (no credits needed)
    FREE_MODELS = [
        "qwen/qwq-32b:free",                    # Qwen 32B reasoning — FREE
        "meta-llama/llama-3.1-8b-instruct:free", # Llama 3.1 8B — FREE
        "mistralai/mistral-7b-instruct:free",    # Mistral 7B — FREE
        "google/gemma-2-9b-it:free",             # Gemma 2 9B — FREE
        "qwen/qwen-2-7b-instruct:free",          # Qwen 2 7B — FREE
    ]

    def __init__(self):
        self.api_key = settings.openrouter_api_key
        self.model = settings.openrouter_model  # Defaults to Qwen free

    async def is_available(self) -> bool:
        return bool(self.api_key and self.api_key not in ("", "your-openrouter-key"))

    async def generate(self, prompt: str, system_prompt: Optional[str] = None,
                       temperature: float = 0.7, max_tokens: int = 4096) -> LLMResponse:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        return await self.chat(messages, temperature, max_tokens)

    @retry(stop=stop_after_attempt(2), wait=wait_exponential(min=2, max=10))
    async def chat(self, messages: list[dict], temperature: float = 0.7,
                   max_tokens: int = 4096) -> LLMResponse:
        if not await self.is_available():
            raise ValueError("OpenRouter API key not configured.")

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "HTTP-Referer": "https://studyabroad.ai",
                    "X-Title": "StudyAbroad.AI",
                },
                json={
                    "model": self.model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                }
            )
            response.raise_for_status()
            data = response.json()

        content = data["choices"][0]["message"]["content"]
        tokens = data.get("usage", {}).get("total_tokens", 0)

        return LLMResponse(
            content=content,
            model=self.model,
            tool_used="openrouter",
            used_fallback=False,
            tokens_used=tokens,
            cost_usd=0.0  # Free models
        )


# ─── OpenAI Client (PAID FALLBACK — emergency only) ──────────────────────────

class OpenAIFallbackClient:
    """
    PAID FALLBACK — Never used in normal operation.
    Only triggered when: all free APIs fail + task is marked critical.
    Uses gpt-4o-mini (cheapest) to minimize cost.
    """

    async def generate(self, prompt: str, system_prompt: Optional[str] = None,
                       temperature: float = 0.7, max_tokens: int = 4096) -> LLMResponse:
        if not settings.openai_api_key:
            raise ValueError("[PAID FALLBACK] OPENAI_API_KEY not set")

        logger.warning(
            "[COST ALERT] Using paid OpenAI API as emergency fallback. "
            "Add GROQ_API_KEY or GEMINI_API_KEY to avoid this cost."
        )

        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.openai_api_key)
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens
        )
        content = response.choices[0].message.content
        tokens = response.usage.total_tokens
        cost = (tokens / 1000) * 0.0003

        return LLMResponse(
            content=content, model="gpt-4o-mini", tool_used="openai",
            used_fallback=True, tokens_used=tokens, cost_usd=cost
        )

    async def chat(self, messages: list[dict], **kwargs) -> LLMResponse:
        prompt = messages[-1]["content"]
        system = next((m["content"] for m in messages if m["role"] == "system"), None)
        return await self.generate(prompt, system, **kwargs)


# ─── Smart LLM Router (Free Cloud APIs First) ─────────────────────────────────

class LLMRouter:
    """
    Routes LLM requests to free cloud APIs.
    NO LOCAL MODELS — uses free cloud services only.
    Priority: Groq (fastest) → Gemini (Google) → OpenRouter (Qwen/Llama) → OpenAI (paid last resort)
    """

    def __init__(self):
        self.groq = GroqClient()
        self.gemini = GeminiClient()
        self.openrouter = OpenRouterClient()
        self._openai = None
        self.total_cost_usd = 0.0
        self.total_requests = 0
        self.requests_by_tool = {"groq": 0, "gemini": 0, "openrouter": 0, "openai": 0}

    @property
    def openai(self) -> OpenAIFallbackClient:
        if self._openai is None:
            self._openai = OpenAIFallbackClient()
        return self._openai

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        critical: bool = False,
        task_name: str = "unknown"
    ) -> LLMResponse:
        """
        Generate with free-cloud-first chain.
        No local models needed — all cloud, all free.
        """
        self.total_requests += 1
        errors = []

        # 1. Groq — fastest, completely free, best for most tasks
        if await self.groq.is_available():
            try:
                result = await self.groq.generate(prompt, system_prompt, temperature, max_tokens)
                self.requests_by_tool["groq"] += 1
                logger.debug(f"[LLM] '{task_name}' → Groq ({result.model}) [$0]")
                return result
            except Exception as e:
                errors.append(f"Groq: {e}")
                logger.warning(f"[LLM] Groq failed for '{task_name}': {type(e).__name__}: {e}")

        # 2. Gemini — Google's free tier, 1M tokens/day
        if await self.gemini.is_available():
            try:
                result = await self.gemini.generate(prompt, system_prompt, temperature, max_tokens)
                self.requests_by_tool["gemini"] += 1
                logger.debug(f"[LLM] '{task_name}' → Gemini free tier [$0]")
                return result
            except Exception as e:
                errors.append(f"Gemini: {e}")
                logger.warning(f"[LLM] Gemini failed for '{task_name}': {type(e).__name__}: {e}")

        # 3. OpenRouter — free Qwen/Llama/Mistral
        if await self.openrouter.is_available():
            try:
                result = await self.openrouter.generate(prompt, system_prompt, temperature, max_tokens)
                self.requests_by_tool["openrouter"] += 1
                logger.debug(f"[LLM] '{task_name}' → OpenRouter ({result.model}) [$0]")
                return result
            except Exception as e:
                errors.append(f"OpenRouter: {e}")
                logger.warning(f"[LLM] OpenRouter failed for '{task_name}': {e}")

        # 4. OpenAI — PAID, only for critical tasks when all free options fail
        if critical and settings.openai_api_key:
            logger.warning(
                f"[PAID FALLBACK] All free LLMs failed for CRITICAL task '{task_name}'. "
                f"Using paid OpenAI. Add API keys to avoid this. Tried: Groq, Gemini, OpenRouter. "
                f"Errors: {'; '.join(errors)}"
            )
            try:
                result = await self.openai.generate(prompt, system_prompt, temperature, max_tokens)
                self.requests_by_tool["openai"] += 1
                self.total_cost_usd += result.cost_usd
                return result
            except Exception as e:
                errors.append(f"OpenAI: {e}")

        raise RuntimeError(
            f"All LLM tools failed for '{task_name}'. Errors: {'; '.join(errors)}.\n"
            f"Setup (all FREE, takes 2 min each):\n"
            f"  1. Groq: https://console.groq.com → set GROQ_API_KEY in .env\n"
            f"  2. Gemini: https://aistudio.google.com/app/apikey → set GEMINI_API_KEY\n"
            f"  3. OpenRouter: https://openrouter.ai → set OPENROUTER_API_KEY"
        )

    async def complete(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        critical: bool = False,
        task_name: str = "unknown"
    ) -> LLMResponse:
        """Alias for generate(). Agents that call llm.complete() are routed here."""
        return await self.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
            critical=critical,
            task_name=task_name,
        )

    async def chat(
        self,
        messages: list[dict],
        temperature: float = 0.7,
        max_tokens: int = 4096,
        critical: bool = False,
        task_name: str = "unknown"
    ) -> LLMResponse:
        """Chat with same free-first priority chain."""
        self.total_requests += 1
        errors = []

        if await self.groq.is_available():
            try:
                return await self.groq.chat(messages, temperature, max_tokens)
            except Exception as e:
                errors.append(f"Groq: {e}")

        if await self.gemini.is_available():
            try:
                return await self.gemini.chat(messages, temperature, max_tokens)
            except Exception as e:
                errors.append(f"Gemini: {e}")

        if await self.openrouter.is_available():
            try:
                return await self.openrouter.chat(messages, temperature, max_tokens)
            except Exception as e:
                errors.append(f"OpenRouter: {e}")

        if critical and settings.openai_api_key:
            return await self.openai.chat(messages, temperature=temperature, max_tokens=max_tokens)

        raise RuntimeError(f"All LLM chat tools failed. Errors: {'; '.join(errors)}")

    def usage_stats(self) -> dict:
        return {
            "total_requests": self.total_requests,
            "by_tool": self.requests_by_tool,
            "total_cost_usd": round(self.total_cost_usd, 4),
            "free_request_pct": round(
                (1 - self.requests_by_tool["openai"] / max(1, self.total_requests)) * 100, 1
            ),
            "note": "Normal operation should be $0/month (Groq + Gemini free tiers)"
        }


# ─── Global LLM instance ──────────────────────────────────────────────────────
llm = LLMRouter()
