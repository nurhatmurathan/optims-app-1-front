# Repository Guidelines

## Project Structure & Module Organization
This Vite + React app boots in `src/main.tsx` and routes screens through `App.tsx`. Feature pages stay in `src/pages`, reusable UI lives in `src/components/{common,product}`, and data access flows from `src/api` to TanStack Query hooks in `src/queries`. Domain types belong in `src/types`, Tailwind entry styles in `src/index.css`, static assets in `public/`, and production bundles land in `dist/`. Use the `@/*` alias (see `tsconfig.app.json`) instead of deep relative paths.

## Build, Test, and Development Commands
- `npm run dev` — Vite dev server with HMR on 5173.
- `npm run build` — run `tsc -b` then create an optimized bundle in `dist/`.
- `npm run preview` — serve the latest build for production-like smoke tests.
- `npm run lint` — flat ESLint (JS, TS, React Hooks, Refresh, Prettier).
- `npm run format` — Prettier write; run it before committing generated JSX.

## Coding Style & Naming Conventions
The repo enforces strict TypeScript, 4-space indentation, and functional React components. Keep business logic inside hooks (`useProduct`, `useProducts`), isolate Axios helpers in `src/api`, and prefer Ant Design + Tailwind utility classes over bespoke CSS unless the rule is reused, in which case extend `src/index.css`. Components and hooks follow PascalCase/camelCase, env-aware helpers belong in `src/config`, and imports should always use the `@/...` alias. Run `npm run lint && npm run format` before opening a PR.

## Testing Guidelines
An automated test runner is not yet wired in, so contributions that add logic should also bootstrap Vitest + React Testing Library specs (the recommended stack for Vite apps). Place specs as `*.test.tsx` beside the component or in `src/__tests__`, stub Axios with MSW/manual mocks, and cover both success and error states (e.g., `getErrorMessage` fallbacks). Until `npm test` exists, document manual QA steps and attach screenshots for any UI change.

## Commit & Pull Request Guidelines
Git history follows lowercase `<type>: <summary>` messages (`fix: chart px`, `chore: product page defaults`), so keep using that imperative style with focused scope. PRs should link the relevant issue, describe the change, list the commands you ran (`npm run lint`, `npm run build`, dev-server smoke test), and include screenshots when UI shifts. Call out any new `VITE_*` variables so reviewers can reproduce API calls quickly.
