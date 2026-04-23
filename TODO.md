# TODO List for Boba Improvements

This list tracks potential improvements and fixes for the `Boba` repository. Items are categorized and prioritized. The overall philosophy is to maintain simplicity in the core template while enhancing developer experience and robustness.

## Immediate Priorities (Core Template Health)

- **`[CRITICAL]`** `[x]` Fix `vite-plugin-component-manifest` production paths:
  - Currently, the dynamic imports generated for production builds in `vite-plugin-component-manifest.ts` (within the `buildStart` hook) seem to point to `.ts` files (e.g., `() => import('./components/${name}/${name}.ts')`).
  - This **must** be corrected to point to the compiled JavaScript assets that Vite produces in the `dist` (or `assets`) directory, including any hashing Vite applies (e.g., `() => import('/assets/component-name.hash.js')`).
  - Reference the `isProduction` flag or `config.command === 'build'` and Vite's `ResolvedConfig` to determine correct output paths.
  - _Verified: Plugin correctly generates production paths with hashes and base path. Issue likely outdated._

- **`[MEDIUM]`** `[x]` Correct `npm test` script:
  - The `test` script in `package.json` currently runs `vite build`.
  - This should be changed to `vitest run` (or a similar Vitest command) to execute the actual test suite.
  - _This also included ensuring placeholder tests exist so `vitest run` passes._

- **`[MEDIUM]`** `[ ]` Add detailed JSDoc/TSDoc comments:
  - Improve inline documentation for core modules like `src/core/base-component.ts` and `src/core/router/router.ts`.
  - Explain parameters, return types, and general purpose of key classes and methods. This serves as a form of "context" for developers and potentially tools.

## Near-Term Enhancements (Developer Experience & Standardization)

- **`[MEDIUM]`** `[x]` PWA Capabilities:
  - Integrated `vite-plugin-pwa` to add Service Worker generation and a Web App Manifest.
  - Configured basic pre-caching for core assets and on-demand caching for lazy-loaded routes to enable offline functionality.
  - **`[TODO]`** Add PWA icons to the `public` directory and reference them in the `vite.config.ts` manifest.

- **`[LOW]`** `[x]` Add Linting and Formatting:
  - Integrate ESLint for TypeScript linting.
  - Integrate Prettier for code formatting.
  - Provide base configuration files (e.g., `eslint.config.js`, `.prettierrc.cjs`).
  - Add corresponding npm scripts (e.g., `lint`, `format`). This helps standardize code contributions.
  - _Also includes setting up a CI workflow (`.github/workflows/ci.yml`) for type-checking, linting, testing, and building._

- **`[MEDIUM]`** `[ ]` Review and Ensure GitHub Pages Deployment:
  - Review the existing `.github/workflows/deploy.yml` for GitHub Pages.
  - Ensure it correctly builds and deploys the example application from the template.
  - Update actions, build steps, and configurations as necessary to align with current project structure and best practices.
  - Confirm successful deployment of a working example to GitHub Pages.

- **`[IDEA/HIGH]`** `[ ]` Design and Implement a Core CLI Tool:
  - Scope out essential features for a Node.js CLI (e.g., `boba-cli` or similar).
  - **Core commands:**
    - `generate component <component-name>`: Scaffolds component `.ts`, `.html`, `.css`, and `.test.ts` files adhering to template conventions.
    - `generate service <service-name>`: Scaffolds a service file in `src/services/`.
    - `add route <path> <component-name>`: (More advanced) Modifies `src/main.ts` to register a route for an existing component.
  - This CLI is a key step in standardizing development workflows and improving developer experience.
  - **Sub-Task `[IDEA/MEDIUM]`:** `[ ]` Investigate CLI generating/maintaining "Context Files" (MCP-Lite). For example, a `project-manifest.json` file listing components, routes, services. This structured data could be used by external tools or provide context for AI code generation assistants.

## High Priority Feature Additions

- **`[HIGH]`** `[ ]` New Example Homepage:
  - Completely redesign the homepage.
  - Showcase the template's capabilities.
  - Use Tailwind CSS for styling.
  - Implement an appropriate professional oss CSS compiler for Tailwind (e.g., PostCSS).
  - Aim for a professional look and feel.

- **`[HIGH]`** `[ ]` New TODO App Page:
  - Create a new page that functions as a TODO application.
  - This will demonstrate more complex component interaction and state management.

- **`[HIGH]`** `[x]` Add Playwright Tests:
  - Initialized Playwright and added a basic test.
  - **`[TODO]`** Add a GitHub Actions workflow to easily run tests on CI.
  - **`[TODO]`** Write Playwright tests for the example app.

## Future Enhancements (Ecosystem & Features)

- **`[LOW]`** `[ ]` Enhance `vite-plugin-component-manifest` flexibility:
  - Consider adding options to the plugin (e.g., specify different component directories, customize generated file path).

- **`[LOW]`** `[ ]` Document `vite-plugin-component-manifest.ts`:
  - Add more detailed comments within the plugin code.

- **`[LOW]`** `[ ]` Contribution Guidelines:
  - Expand the "Contributing" section in `README.md`.

- **`[LOW]`** `[ ]` Enhance Router capabilities:
  - Support for route parameters (e.g., `/users/:id`).
  - Route guards or navigation lifecycle hooks.

- **`[LOW]`** `[ ]` Inter-component communication examples:
  - Provide examples/guidance in the README (e.g., events, props, simple state store/service).

- **`[LOW]`** `[ ]` Error Handling in Router:
  - Improve `show404` or allow for custom error components.

- **`[LOW]`** `[ ]` Advanced Sample Component:
  - Demonstrate form handling, API calls, service usage.

## Visionary / Long-Term (Advanced Tooling & Architecture)

- **`[VISION/LONG-TERM]`** `[ ]` Model Context Protocol (MCP) Server:
  - Building upon the CLI and "Context Files", explore creating a full MCP server.
  - This server would provide a rich, real-time API about the project's state and conventions, designed for advanced AI development assistants to understand and interact with the codebase deeply.
  - This would be a significant undertaking, pursued if the template ecosystem matures and there's clear demand for such deep AI integration.

Please prioritize items starting from "Immediate Priorities".
