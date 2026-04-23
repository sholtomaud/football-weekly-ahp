# Proposed Solutions for Boba Framework Review (2026-04-02)

This document outlines the proposed solutions for the issues identified in the repository review dated 2026-04-02.

## 1. Short-Term Enhancements (To be implemented now)

### 1.1. DX for Large Components (Tagged Template Literals)
**Issue:** Lack of IDE syntax highlighting for HTML/CSS in template literals.
**Solution:** Implement `html` and `css` tagged template helpers in `template/src/core/base-component.ts`. These functions will return the raw concatenated string, which is sufficient for modern IDEs (like VS Code with the "lit-html" or "es6-string-html" extensions) to provide syntax highlighting and linting.

### 1.2. State Management (Native Store Pattern)
**Issue:** No built-in pattern for state management.
**Solution:** Introduce a minimalist `Store` class in `template/src/core/store.ts` that extends `EventTarget`. It will provide a `getState()` method and a `setState(newState)` method that merges the state and dispatches a 'change' event. This aligns with the "low tool" philosophy by using native browser APIs.

### 1.3. Router Limitations (Dynamic Routes)
**Issue:** Lack of support for route parameters (e.g., `/user/:id`).
**Solution:** Enhance the `Router` in `template/src/core/router/router.ts` to support dynamic segments using a simple regex-based matcher. The `registerRoute` method will convert `:param` syntax into regex, and `handleRoute` will extract these parameters and pass them to the loaded component.

## 2. Long-Term Strategy & Mitigations

### 2.1. Vite Dependency (Move to Import Maps)
**Proposal:** Explore replacing Vite with a combination of a minimalist static server (like `sirv-cli` or even a simple Node.js script) and native Import Maps. Since Boba uses Node.js v25+ native type stripping, the main hurdle is module resolution in the browser. Import Maps can handle this without a build step, moving Boba closer to a zero-tool production environment.

### 2.2. CLI Expansion (Generators)
**Proposal:** Enhance the `create-boba-app` CLI to include generators (e.g., `npx boba generate component my-button`). This will help maintain architectural consistency and improve DX without increasing the runtime complexity.

### 2.3. CSP by Default
**Proposal:** Include a recommended Content Security Policy (CSP) in the `index.html` of the scaffolded application. This encourages a "security-first" mindset.
**Immediate Action:** Add a `<meta http-equiv="Content-Security-Policy" ...>` tag to `template/index.html` as part of the current implementation.

## 3. Implementation Plan
We will follow Test-Driven Development (TDD) for the short-term implementation items (Store, Template Helpers, and Router Improvements).
