# Boba - A Minimalist Web Component Framework

**Boba** is a ultra-minimalist template for building fast, modular web applications using TypeScript and Web Components. It leverages native browser features and Node.js v25+ native type stripping for a build-less development experience.

## Create a New Boba App

You can create a new Boba application using `npx`.

```bash
npx github:sholtomaud/boba <your-app-name>
```

This will create a new directory called `<your-app-name>` with a new Boba project.

## Core Philosophy

- **Build-less Workflow:** Browsers run the code directly. Vite is used for development to leverage Node.js v25+ native type stripping.
- **Native Standards:** Uses standard ES Modules, Web Components (Shadow DOM), and CSS.
- **Minimal Dependencies:** Only uses `playwright` for testing and `vite` for development.
- **Node.js v25+:** Leverages native TypeScript stripping for a seamless development experience without a complex build pipeline.

## Key Features

- **Web Component-Based Architecture:** True encapsulation with Shadow DOM.
- **`BaseComponent` (`src/core/base-component.ts`):** A foundational class that simplifies component creation.
- **Client-Side Router (`src/core/router/router.ts`):** A lightweight, singleton router that dynamically loads components.
- **Playwright for Testing:** Modern E2E testing out of the box.

## Getting Started

### Prerequisites

- Node.js v25 or higher.

### Installation

1.  Navigate to the project directory:
    ```bash
    cd your-project-name
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Install Playwright browsers:
    ```bash
    npx playwright install --with-deps
    ```

### Available Scripts

- **`npm run dev`**: Starts the development server using Vite.
- **`npm test`**: Runs unit tests.
- **`npm run e2e`**: Runs E2E tests using Playwright.

## Developing Your Own Application

### Project Structure Overview

- **`src/components/`**: Your application's web components.
- **`src/core/`**: Core modules (BaseComponent, Router).
- **`src/main.ts`**: Main entry point.
- **`index.html`**: The main HTML file.

### Creating a New Component

1.  **Create a new directory** under `src/components/`, e.g., `src/components/user-profile/`.
2.  **Create the component file:** `user-profile.ts`.
3.  **Implement the component:**

    ```typescript
    const html = `<h1>User Profile</h1>`;
    const css = `h1 { color: blue; }`;
    import { BaseComponent } from '../../core/base-component.ts';

    export class UserProfileComponent extends BaseComponent {
      static tagName = 'user-profile';
      constructor() {
        super(html, css);
      }
      init() {
        console.log('Profile initialized');
      }
    }

    if (!customElements.get(UserProfileComponent.tagName)) {
      customElements.define(UserProfileComponent.tagName, UserProfileComponent);
    }
    ```

### Adding Routes

Open `src/main.ts` and register a new route:

```typescript
const router = Router.getInstance();
router.registerRoute({ path: '/profile', component: 'user-profile' });
```

## Contributing

Contributions are welcome! Please see `TODO.md` for current priorities.
