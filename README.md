# Sentinel-DevEx-Kit

Monorepo scaffold for the Sentinel Developer Experience toolkit.

## Monorepo layout

Below is a simple Mermaid graph showing the packages and their dependencies.

```mermaid
graph TD
	Root[repo root]
	Core[packages/core-engine]\n(shared TS library)
	CLI[packages/cli]\n(CLI tool)
	Dashboard[apps/dashboard]\n(Vite + React)

	Root --> Core
	Root --> CLI
	Root --> Dashboard

	CLI --> Core
	Dashboard --> Core
```

## Quickstart

Install dependencies:

```bash
pnpm install
```

Build the monorepo:

```bash
pnpm build
```

Run the dashboard dev server:

```bash
pnpm --filter sentinel-dashboard dev
```

Run the CLI locally after build:

```bash
node packages/cli/dist/bin/sentinel.js
```

## Notes

- `packages/core-engine` is built as dual output (ESM + CJS) with types so both `import` and `require` consumers work.
- Keep public API surface in `packages/core-engine/src/index.ts` and avoid exporting internal modules.
- If you want, I can add more diagrams (sequence diagrams, package-dependency graphs) or an `examples/` folder.
