## ============================================================
## StudyAbroad.AI — Developer Makefile
## ============================================================

.PHONY: dev dev-backend dev-frontend dev-scraper \
        install install-py install-node \
        build docker-up docker-down docker-logs \
        test test-api lint format clean help

# ── Colors ────────────────────────────────────────────────────
CYAN  := \033[0;36m
GREEN := \033[0;32m
RESET := \033[0m

# ── Default target ────────────────────────────────────────────
help:
	@echo "$(CYAN)StudyAbroad.AI — Developer Commands$(RESET)"
	@echo ""
	@echo "  $(GREEN)make install$(RESET)        Install all Python + Node dependencies"
	@echo "  $(GREEN)make dev$(RESET)            Start ALL 4 services in parallel (recommended)"
	@echo "  $(GREEN)make dev-backend$(RESET)    Start Python FastAPI only"
	@echo "  $(GREEN)make dev-frontend$(RESET)   Start Next.js only"
	@echo "  $(GREEN)make dev-scraper$(RESET)    Start Node.js scraper service only"
	@echo ""
	@echo "  $(GREEN)make docker-up$(RESET)      Build & start all 5 Docker services"
	@echo "  $(GREEN)make docker-down$(RESET)    Stop all Docker services"
	@echo "  $(GREEN)make docker-logs$(RESET)    Tail logs from all services"
	@echo ""
	@echo "  $(GREEN)make test$(RESET)           Run all tests"
	@echo "  $(GREEN)make test-api$(RESET)       Test API endpoints (server must be running)"
	@echo "  $(GREEN)make lint$(RESET)           Lint Python + TypeScript code"
	@echo "  $(GREEN)make format$(RESET)         Format all code (black + prettier)"
	@echo "  $(GREEN)make clean$(RESET)          Remove build artifacts"

# ── Install ───────────────────────────────────────────────────
install: install-py install-node
	@echo "$(GREEN)✓ All dependencies installed$(RESET)"

install-py:
	@echo "$(CYAN)Installing Python dependencies...$(RESET)"
	cd studyabroad_ai && pip install -r requirements.txt
	playwright install chromium

install-node:
	@echo "$(CYAN)Installing Node.js dependencies...$(RESET)"
	cd studyabroad_ai/frontend && npm install
	cd studyabroad_ai/scraper-service && npm install
	npx puppeteer browsers install chrome

# ── Dev ───────────────────────────────────────────────────────
dev:
	@echo "$(CYAN)Starting all services...$(RESET)"
	@echo "  Backend:  http://localhost:8000"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Scraper:  http://localhost:3001"
	@echo "  API Docs: http://localhost:8000/api/docs"
	@echo ""
	$(MAKE) -j4 dev-backend dev-frontend dev-scraper dev-redis

dev-redis:
	docker run --rm -p 6379:6379 redis:7-alpine

dev-backend:
	@echo "$(CYAN)Starting Python FastAPI...$(RESET)"
	cd studyabroad_ai && python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

dev-frontend:
	@echo "$(CYAN)Starting Next.js...$(RESET)"
	cd studyabroad_ai/frontend && npm run dev

dev-scraper:
	@echo "$(CYAN)Starting Node.js scraper service...$(RESET)"
	cd studyabroad_ai/scraper-service && npm run dev

# ── Docker ────────────────────────────────────────────────────
docker-up:
	docker compose -f studyabroad_ai/docker-compose.yml up --build -d
	@echo "$(GREEN)✓ All services started$(RESET)"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:8000"
	@echo "  API Docs: http://localhost:8000/api/docs"

docker-down:
	docker compose -f studyabroad_ai/docker-compose.yml down

docker-logs:
	docker compose -f studyabroad_ai/docker-compose.yml logs -f

docker-rebuild:
	docker compose -f studyabroad_ai/docker-compose.yml up --build --force-recreate -d

# ── Testing ───────────────────────────────────────────────────
test:
	@echo "$(CYAN)Running Python tests...$(RESET)"
	cd studyabroad_ai && python -m pytest tests/ -v
	@echo "$(CYAN)Running TypeScript type check...$(RESET)"
	cd studyabroad_ai/frontend && npx tsc --noEmit

test-api:
	@echo "$(CYAN)Testing API endpoints...$(RESET)"
	python -m httpx http://localhost:8000/health
	python -m httpx -m POST http://localhost:8000/api/v1/profile/analyze \
		-H "Content-Type: application/json" \
		-d '{"gpa": 3.8, "gpa_scale": 4.0, "ielts_score": 7.5}'

# ── Code Quality ──────────────────────────────────────────────
lint:
	@echo "$(CYAN)Linting Python code...$(RESET)"
	cd studyabroad_ai && python -m flake8 backend/ --max-line-length=120 --ignore=E501,W503
	@echo "$(CYAN)Linting TypeScript...$(RESET)"
	cd studyabroad_ai/frontend && npx eslint app/ lib/ --ext .ts,.tsx

format:
	@echo "$(CYAN)Formatting Python code...$(RESET)"
	cd studyabroad_ai && python -m black backend/ --line-length 100
	@echo "$(CYAN)Formatting TypeScript...$(RESET)"
	cd studyabroad_ai/frontend && npx prettier --write "app/**/*.tsx" "lib/**/*.ts"

# ── Cleanup ───────────────────────────────────────────────────
clean:
	@echo "$(CYAN)Cleaning build artifacts...$(RESET)"
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null; true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null; true
	find . -name "*.pyc" -delete 2>/dev/null; true
	rm -rf studyabroad_ai/frontend/.next 2>/dev/null; true
	rm -rf studyabroad_ai/scraper-service/dist 2>/dev/null; true
	@echo "$(GREEN)✓ Clean$(RESET)"
