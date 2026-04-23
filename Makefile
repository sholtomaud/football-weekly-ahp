IMAGE_APP   := football-weekly-ahp
CONTAINER_BIN := container
WORKDIR     := /app

# Volume-mount project root and persist node_modules in a named volume
RUN := $(CONTAINER_BIN) run -it --rm \
	-v "$(PWD):$(WORKDIR)" \
	-v fwahp_node_modules:$(WORKDIR)/node_modules \
	-p 5173:5173 -p 4173:4173 \
	$(IMAGE_APP)

# Background-safe version (no -it) for CI/scripted use
RUN_CI := $(CONTAINER_BIN) run --rm \
	-v "$(PWD):$(WORKDIR)" \
	-v fwahp_node_modules:$(WORKDIR)/node_modules \
	$(IMAGE_APP)

.PHONY: build build-app run-dev preview test e2e shell install help

## build: Build the container image
build:
	$(CONTAINER_BIN) build -t $(IMAGE_APP) .

## build-app: Build the production JS bundle (dist/)
build-app:
	$(RUN) sh -c "npm run build"

## install: Install npm dependencies inside the container
install:
	$(RUN) sh -c "npm install"

## run-dev: Start Vite dev server (http://localhost:5173)
run-dev:
	$(RUN) sh -c "npm install && npm run dev -- --host 0.0.0.0"

## preview: Preview the production build locally (http://localhost:4173/football-weekly-ahp/)
preview:
	$(RUN) sh -c "npm run preview -- --host 0.0.0.0"

## test: Run unit tests (node:test)
test:
	$(RUN_CI) sh -c "npm install && npm test"

## e2e: Run Playwright E2E tests (requires browsers installed)
e2e:
	$(CONTAINER_BIN) run --rm \
		-v "$(PWD):$(WORKDIR)" \
		-v fwahp_node_modules:$(WORKDIR)/node_modules \
		mcr.microsoft.com/playwright:v1.58.2-noble \
		sh -c "cd $(WORKDIR) && npm install && npx playwright install --with-deps && npx playwright test"

## shell: Open an interactive shell in the container
shell:
	$(RUN) bash

## help: Show this help message
help:
	@grep -E '^## ' Makefile | sed 's/## /  /'
